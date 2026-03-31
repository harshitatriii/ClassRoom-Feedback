from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStudent, IsAdminUser, IsFaculty, IsFacultyOrAdmin
from courses.models import Subject
from .models import Feedback, FeedbackResponse, FeedbackCampaign
from .serializers import (
    FeedbackCreateSerializer, FeedbackDetailSerializer,
    FeedbackResponseCreateSerializer, FeedbackResponseSerializer,
    FeedbackCampaignSerializer,
)


class FeedbackViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'delete', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return FeedbackCreateSerializer
        return FeedbackDetailSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        if self.action == 'destroy':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Feedback.objects.select_related(
            'student', 'subject', 'subject__faculty',
            'subject__program', 'subject__program__school'
        ).prefetch_related('sentiment', 'response')

        if user.role == 'student':
            qs = qs.filter(student=user)
        elif user.role == 'faculty':
            qs = qs.filter(subject__faculty=user)

        subject_id = self.request.query_params.get('subject')
        if subject_id:
            qs = qs.filter(subject_id=subject_id)

        return qs


class FeedbackResponseViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ('create',):
            return FeedbackResponseCreateSerializer
        return FeedbackResponseSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update'):
            return [IsFaculty()]
        if self.action == 'destroy':
            return [IsFaculty()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = FeedbackResponse.objects.select_related('faculty', 'feedback', 'feedback__subject')

        if user.role == 'faculty':
            qs = qs.filter(faculty=user)
        elif user.role == 'student':
            qs = qs.filter(feedback__student=user)

        feedback_id = self.request.query_params.get('feedback')
        if feedback_id:
            qs = qs.filter(feedback_id=feedback_id)

        return qs

    def perform_update(self, serializer):
        # Only allow faculty to update their own responses
        if serializer.instance.faculty != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own responses.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.faculty != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own responses.")
        instance.delete()


class CampaignViewSet(viewsets.ModelViewSet):
    """CRUD for feedback campaigns. Admin only for create/update/delete."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FeedbackCampaignSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = FeedbackCampaign.objects.select_related('program', 'created_by')
        user = self.request.user

        if user.role == 'student':
            # Students see only campaigns that target their program+semester or are global
            qs = qs.filter(
                Q(program__isnull=True) | Q(program=user.program),
                Q(semester__isnull=True) | Q(semester=user.current_semester),
                is_active=True,
            )

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CampaignStudentStatusView(APIView):
    """
    Returns the student's progress for all active open campaigns.
    Shows how many subjects they've completed feedback for vs total required.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        now = timezone.now()

        # Find open campaigns that apply to this student
        campaigns = FeedbackCampaign.objects.filter(
            Q(program__isnull=True) | Q(program=user.program),
            Q(semester__isnull=True) | Q(semester=user.current_semester),
            is_active=True,
            start_date__lte=now,
            end_date__gte=now,
        ).select_related('program')

        # Student's subjects
        student_subjects = Subject.objects.filter(
            is_active=True,
            program=user.program,
            semester=user.current_semester,
        )
        subject_ids = set(student_subjects.values_list('id', flat=True))

        # Already submitted feedback
        completed_ids = set(
            Feedback.objects.filter(student=user, subject_id__in=subject_ids)
            .values_list('subject_id', flat=True)
        )

        results = []
        for campaign in campaigns:
            # If campaign targets a specific semester, filter subjects
            campaign_subjects = student_subjects
            if campaign.semester and campaign.semester != user.current_semester:
                continue

            total = campaign_subjects.count()
            completed = len(completed_ids & subject_ids)
            pending = campaign_subjects.exclude(id__in=completed_ids)

            results.append({
                'campaign': FeedbackCampaignSerializer(campaign).data,
                'total_subjects': total,
                'completed_subjects': completed,
                'pending_subjects': [
                    {'id': s.id, 'name': s.name, 'code': s.code}
                    for s in pending
                ],
                'completion_percentage': round((completed / total * 100) if total > 0 else 0, 1),
            })

        return Response(results)


class CampaignCompletionView(APIView):
    """
    Admin view: shows completion stats for a campaign across all targeted students.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, campaign_id):
        try:
            campaign = FeedbackCampaign.objects.select_related('program').get(pk=campaign_id)
        except FeedbackCampaign.DoesNotExist:
            return Response({'detail': 'Campaign not found.'}, status=404)

        from accounts.models import CustomUser

        # Find targeted students
        students_qs = CustomUser.objects.filter(role='student')
        if campaign.program:
            students_qs = students_qs.filter(program=campaign.program)
        if campaign.semester:
            students_qs = students_qs.filter(current_semester=campaign.semester)

        # Find subjects for those students
        subjects_qs = Subject.objects.filter(is_active=True)
        if campaign.program:
            subjects_qs = subjects_qs.filter(program=campaign.program)
        if campaign.semester:
            subjects_qs = subjects_qs.filter(semester=campaign.semester)

        total_students = students_qs.count()
        total_subjects = subjects_qs.count()
        expected_submissions = total_students * total_subjects
        subject_ids = set(subjects_qs.values_list('id', flat=True))

        # All submissions for targeted students+subjects (regardless of date —
        # feedback is one-per-student-per-subject, so if it exists, it's done)
        actual_submissions = Feedback.objects.filter(
            student__in=students_qs,
            subject__in=subjects_qs,
        ).count()

        # Students who completed ALL subjects
        completed_students = 0
        for student in students_qs:
            student_feedback_ids = set(
                Feedback.objects.filter(student=student, subject_id__in=subject_ids)
                .values_list('subject_id', flat=True)
            )
            if subject_ids == student_feedback_ids:
                completed_students += 1

        return Response({
            'campaign': FeedbackCampaignSerializer(campaign).data,
            'total_students': total_students,
            'total_subjects': total_subjects,
            'expected_submissions': expected_submissions,
            'actual_submissions': actual_submissions,
            'completed_students': completed_students,
            'completion_rate': round((completed_students / total_students * 100) if total_students > 0 else 0, 1),
            'submission_rate': round((actual_submissions / expected_submissions * 100) if expected_submissions > 0 else 0, 1),
        })

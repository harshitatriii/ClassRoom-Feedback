from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from accounts.permissions import IsStudent, IsAdminUser, IsFaculty
from .models import Feedback, FeedbackResponse
from .serializers import (
    FeedbackCreateSerializer, FeedbackDetailSerializer,
    FeedbackResponseCreateSerializer, FeedbackResponseSerializer,
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

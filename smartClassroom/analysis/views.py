from django.db.models import Avg, Count
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsFacultyOrAdmin, IsAdminUser
from courses.models import School, Subject
from feedback.models import Feedback
from .models import SentimentResult


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'student':
            feedbacks = Feedback.objects.filter(student=user)
            # Count available subjects for this student's program + semester
            available_subjects = Subject.objects.filter(is_active=True)
            if user.program_id:
                available_subjects = available_subjects.filter(program=user.program)
            if user.current_semester:
                available_subjects = available_subjects.filter(semester=user.current_semester)
            return Response({
                'total_feedback': feedbacks.count(),
                'subjects_count': available_subjects.count(),
                'feedback_given_count': feedbacks.values('subject').distinct().count(),
                'avg_rating': feedbacks.aggregate(avg=Avg('rating_overall'))['avg'],
            })

        elif user.role == 'faculty':
            feedbacks = Feedback.objects.filter(subject__faculty=user)
            sentiments = SentimentResult.objects.filter(feedback__subject__faculty=user)
            return Response({
                'total_feedback': feedbacks.count(),
                'subjects_count': Subject.objects.filter(faculty=user).count(),
                'avg_rating': feedbacks.aggregate(avg=Avg('rating_overall'))['avg'],
                'avg_sentiment': sentiments.aggregate(avg=Avg('polarity'))['avg'],
                'sentiment_distribution': {
                    'positive': sentiments.filter(sentiment_label='positive').count(),
                    'neutral': sentiments.filter(sentiment_label='neutral').count(),
                    'negative': sentiments.filter(sentiment_label='negative').count(),
                },
            })

        else:  # admin
            feedbacks = Feedback.objects.all()
            sentiments = SentimentResult.objects.all()
            return Response({
                'total_users': user.__class__.objects.count(),
                'total_feedback': feedbacks.count(),
                'total_subjects': Subject.objects.count(),
                'total_schools': School.objects.count(),
                'avg_rating': feedbacks.aggregate(avg=Avg('rating_overall'))['avg'],
                'avg_sentiment': sentiments.aggregate(avg=Avg('polarity'))['avg'],
                'sentiment_distribution': {
                    'positive': sentiments.filter(sentiment_label='positive').count(),
                    'neutral': sentiments.filter(sentiment_label='neutral').count(),
                    'negative': sentiments.filter(sentiment_label='negative').count(),
                },
            })


class SubjectSentimentView(APIView):
    permission_classes = [IsFacultyOrAdmin]

    def get(self, request, subject_id):
        try:
            subject = Subject.objects.get(pk=subject_id)
        except Subject.DoesNotExist:
            return Response({"detail": "Subject not found."}, status=404)

        if request.user.role == 'faculty' and subject.faculty != request.user:
            return Response({"detail": "Not your subject."}, status=403)

        feedbacks = Feedback.objects.filter(subject=subject)
        sentiments = SentimentResult.objects.filter(feedback__subject=subject)

        rating_averages = feedbacks.aggregate(
            avg_teaching=Avg('rating_teaching'),
            avg_content=Avg('rating_content'),
            avg_engagement=Avg('rating_engagement'),
            avg_overall=Avg('rating_overall'),
            total_count=Count('id'),
        )

        sentiment_distribution = {
            'positive': sentiments.filter(sentiment_label='positive').count(),
            'neutral': sentiments.filter(sentiment_label='neutral').count(),
            'negative': sentiments.filter(sentiment_label='negative').count(),
        }

        avg_polarity = sentiments.aggregate(avg=Avg('polarity'))['avg']

        all_keywords = {}
        for s in sentiments:
            for kw in s.keywords:
                all_keywords[kw] = all_keywords.get(kw, 0) + 1
        top_keywords = sorted(all_keywords.items(), key=lambda x: x[1], reverse=True)[:20]

        trend_data = []
        for fb in feedbacks.order_by('created_at'):
            entry = {'date': fb.created_at.strftime('%Y-%m-%d'), 'rating': fb.rating_overall}
            try:
                entry['polarity'] = fb.sentiment.polarity
            except SentimentResult.DoesNotExist:
                entry['polarity'] = None
            trend_data.append(entry)

        return Response({
            'subject': {
                'id': subject.id,
                'code': subject.code,
                'name': subject.name,
            },
            'ratings': rating_averages,
            'sentiment_distribution': sentiment_distribution,
            'average_polarity': avg_polarity,
            'keywords': [{'word': w, 'count': c} for w, c in top_keywords],
            'trends': trend_data,
        })


class SchoolAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        school_id = request.query_params.get('school')
        program_id = request.query_params.get('program')
        subjects_qs = Subject.objects.filter(is_active=True)

        if school_id:
            subjects_qs = subjects_qs.filter(program__school_id=school_id)
        if program_id:
            subjects_qs = subjects_qs.filter(program_id=program_id)

        data = []
        for subject in subjects_qs.select_related('faculty', 'program', 'program__school'):
            sentiments = SentimentResult.objects.filter(feedback__subject=subject)
            feedbacks = Feedback.objects.filter(subject=subject)
            data.append({
                'subject_id': subject.id,
                'subject_code': subject.code,
                'subject_name': subject.name,
                'faculty_name': subject.faculty.get_full_name() or subject.faculty.username,
                'school_code': subject.program.school.code,
                'program_code': subject.program.code,
                'semester': subject.semester,
                'feedback_count': feedbacks.count(),
                'avg_overall_rating': feedbacks.aggregate(avg=Avg('rating_overall'))['avg'],
                'avg_polarity': sentiments.aggregate(avg=Avg('polarity'))['avg'],
                'sentiment_distribution': {
                    'positive': sentiments.filter(sentiment_label='positive').count(),
                    'neutral': sentiments.filter(sentiment_label='neutral').count(),
                    'negative': sentiments.filter(sentiment_label='negative').count(),
                },
            })

        return Response({'subjects': data})

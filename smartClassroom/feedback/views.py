from rest_framework import viewsets, permissions

from accounts.permissions import IsStudent, IsAdminUser
from .models import Feedback
from .serializers import FeedbackCreateSerializer, FeedbackDetailSerializer


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
        ).prefetch_related('sentiment')

        if user.role == 'student':
            qs = qs.filter(student=user)
        elif user.role == 'faculty':
            qs = qs.filter(subject__faculty=user)

        subject_id = self.request.query_params.get('subject')
        if subject_id:
            qs = qs.filter(subject_id=subject_id)

        return qs

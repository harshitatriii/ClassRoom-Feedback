from rest_framework import viewsets, permissions

from accounts.permissions import IsAdminUser
from .models import School, Program, Subject
from .serializers import (
    SchoolSerializer, SchoolListSerializer,
    ProgramSerializer, ProgramListSerializer,
    SubjectSerializer, SubjectListSerializer,
)


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return SchoolListSerializer
        return SchoolSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.select_related('school').all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProgramListSerializer
        return ProgramSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        school_id = self.request.query_params.get('school')
        if school_id:
            qs = qs.filter(school_id=school_id)
        return qs


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.select_related('faculty', 'program', 'program__school').all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return SubjectListSerializer
        return SubjectSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role == 'faculty':
            qs = qs.filter(faculty=user)

        if user.role == 'student':
            if user.program_id:
                qs = qs.filter(program=user.program)
            if user.current_semester:
                qs = qs.filter(semester=user.current_semester)

        school_id = self.request.query_params.get('school')
        if school_id:
            qs = qs.filter(program__school_id=school_id)

        program_id = self.request.query_params.get('program')
        if program_id:
            qs = qs.filter(program_id=program_id)

        semester = self.request.query_params.get('semester')
        if semester:
            qs = qs.filter(semester=semester)

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        return qs

from rest_framework import serializers

from accounts.serializers import UserMinimalSerializer
from .models import School, Program, Subject


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ('id', 'name', 'code', 'description', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class SchoolListSerializer(serializers.ModelSerializer):
    program_count = serializers.IntegerField(source='programs.count', read_only=True)

    class Meta:
        model = School
        fields = ('id', 'name', 'code', 'is_active', 'program_count')


class ProgramSerializer(serializers.ModelSerializer):
    school_detail = SchoolSerializer(source='school', read_only=True)

    class Meta:
        model = Program
        fields = (
            'id', 'name', 'code', 'school', 'school_detail',
            'total_semesters', 'is_active', 'created_at',
        )
        read_only_fields = ('id', 'created_at')


class ProgramListSerializer(serializers.ModelSerializer):
    school_code = serializers.CharField(source='school.code', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = Program
        fields = ('id', 'name', 'code', 'school', 'school_code', 'school_name',
                  'total_semesters', 'is_active')


class SubjectSerializer(serializers.ModelSerializer):
    faculty_detail = UserMinimalSerializer(source='faculty', read_only=True)
    program_detail = ProgramListSerializer(source='program', read_only=True)

    class Meta:
        model = Subject
        fields = (
            'id', 'name', 'code', 'program', 'program_detail', 'semester',
            'faculty', 'faculty_detail', 'academic_year', 'is_active',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, data):
        program = data.get('program')
        semester = data.get('semester')
        if program and semester:
            if semester < 1 or semester > program.total_semesters:
                raise serializers.ValidationError({
                    'semester': f'Semester must be between 1 and {program.total_semesters} for {program.code}.'
                })
        return data


class SubjectListSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.get_full_name', read_only=True)
    program_code = serializers.CharField(source='program.code', read_only=True)
    school_code = serializers.CharField(source='program.school.code', read_only=True)

    class Meta:
        model = Subject
        fields = ('id', 'name', 'code', 'program', 'program_code', 'school_code',
                  'semester', 'faculty', 'faculty_name', 'academic_year', 'is_active')

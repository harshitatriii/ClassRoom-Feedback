from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'school', 'program', 'current_semester',
            'enrollment_no', 'faculty_id', 'phone',
            'password', 'password2',
        )

    def validate_role(self, value):
        if value == 'admin':
            raise serializers.ValidationError("Admin accounts cannot be created via registration.")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})

        role = data.get('role', 'student')

        if role == 'student':
            if not data.get('enrollment_no'):
                raise serializers.ValidationError({"enrollment_no": "Required for students."})
            if not data.get('school'):
                raise serializers.ValidationError({"school": "Required for students."})
            if not data.get('program'):
                raise serializers.ValidationError({"program": "Required for students."})
            if not data.get('current_semester'):
                raise serializers.ValidationError({"current_semester": "Required for students."})
            program = data['program']
            school = data['school']
            if program.school_id != school.id:
                raise serializers.ValidationError({"program": "This program does not belong to the selected school."})
            if data['current_semester'] < 1 or data['current_semester'] > program.total_semesters:
                raise serializers.ValidationError({
                    "current_semester": f"Must be between 1 and {program.total_semesters}."
                })

        if role == 'faculty':
            if not data.get('faculty_id'):
                raise serializers.ValidationError({"faculty_id": "Required for faculty."})
            if not data.get('school'):
                raise serializers.ValidationError({"school": "Required for faculty."})

        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user is None:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account is disabled.")
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    school_detail = serializers.SerializerMethodField()
    program_detail = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'school', 'school_detail', 'program', 'program_detail',
            'current_semester', 'enrollment_no', 'faculty_id', 'phone',
        )
        read_only_fields = ('id', 'username', 'role')

    def get_school_detail(self, obj):
        if obj.school:
            return {'id': obj.school.id, 'code': obj.school.code, 'name': obj.school.name}
        return None

    def get_program_detail(self, obj):
        if obj.program:
            return {
                'id': obj.program.id, 'code': obj.program.code,
                'name': obj.program.name, 'total_semesters': obj.program.total_semesters,
            }
        return None


class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    school_code = serializers.CharField(source='school.code', read_only=True, default=None)

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'full_name', 'role', 'school_code')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

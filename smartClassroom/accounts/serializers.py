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
            'role', 'department', 'enrollment_no', 'faculty_id', 'phone',
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
        if role == 'student' and not data.get('enrollment_no'):
            raise serializers.ValidationError({"enrollment_no": "Required for students."})
        if role == 'faculty' and not data.get('faculty_id'):
            raise serializers.ValidationError({"faculty_id": "Required for faculty."})
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
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'department', 'enrollment_no', 'faculty_id', 'phone',
        )
        read_only_fields = ('id', 'username', 'role')


class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'full_name', 'role', 'department')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

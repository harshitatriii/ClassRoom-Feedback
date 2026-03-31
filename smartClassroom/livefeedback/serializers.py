from rest_framework import serializers
from .models import LiveSession, LivePulse


class LiveSessionSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    pulse_count = serializers.SerializerMethodField()

    class Meta:
        model = LiveSession
        fields = (
            'id', 'faculty', 'faculty_name', 'subject', 'subject_name',
            'subject_code', 'session_code', 'is_active',
            'started_at', 'ended_at', 'pulse_count',
        )
        read_only_fields = ('id', 'faculty', 'session_code', 'started_at', 'ended_at')

    def get_faculty_name(self, obj):
        return obj.faculty.get_full_name() or obj.faculty.username

    def get_pulse_count(self, obj):
        return obj.pulses.count()


class LivePulseSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivePulse
        fields = ('id', 'session', 'reaction', 'created_at')
        read_only_fields = ('id', 'created_at')

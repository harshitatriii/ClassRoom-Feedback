from rest_framework import serializers
from .models import LiveSession, LivePulse, LiveQuestion


class LiveSessionSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    subject_code = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    pulse_count = serializers.SerializerMethodField()

    class Meta:
        model = LiveSession
        fields = (
            'id', 'faculty', 'faculty_name', 'subject', 'subject_name',
            'subject_code', 'title', 'session_type', 'display_name',
            'session_code', 'is_active',
            'started_at', 'ended_at', 'pulse_count',
        )
        read_only_fields = ('id', 'faculty', 'session_code', 'started_at', 'ended_at')

    def get_faculty_name(self, obj):
        return obj.faculty.get_full_name() or obj.faculty.username

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None

    def get_subject_code(self, obj):
        return obj.subject.code if obj.subject else None

    def get_pulse_count(self, obj):
        return obj.pulses.count()


class LivePulseSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivePulse
        fields = ('id', 'session', 'reaction', 'created_at')
        read_only_fields = ('id', 'created_at')


class LiveQuestionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    upvote_count = serializers.SerializerMethodField()
    has_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = LiveQuestion
        fields = (
            'id', 'session', 'student_name', 'text', 'is_anonymous',
            'is_answered', 'upvote_count', 'has_upvoted', 'created_at',
        )
        read_only_fields = ('id', 'created_at', 'is_answered')

    def get_student_name(self, obj):
        if obj.is_anonymous or not obj.student:
            return 'Anonymous'
        return obj.student.get_full_name() or obj.student.username

    def get_upvote_count(self, obj):
        # Use annotated value if available (from ListQuestionsView), else count
        if hasattr(obj, '_upvote_count'):
            return obj._upvote_count
        return getattr(obj, 'upvote_count', obj.votes.count())

    def get_has_upvoted(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.votes.filter(student=request.user).exists()

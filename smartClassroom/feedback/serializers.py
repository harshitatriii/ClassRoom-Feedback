from rest_framework import serializers

from accounts.serializers import UserMinimalSerializer
from courses.serializers import SubjectListSerializer
from .models import Feedback, FeedbackResponse


class FeedbackResponseSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = FeedbackResponse
        fields = ('id', 'feedback', 'faculty', 'faculty_name', 'response_text', 'created_at', 'updated_at')
        read_only_fields = ('id', 'faculty', 'faculty_name', 'created_at', 'updated_at')

    def get_faculty_name(self, obj):
        return obj.faculty.get_full_name() or obj.faculty.username


class FeedbackResponseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackResponse
        fields = ('id', 'feedback', 'response_text', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_feedback(self, value):
        request = self.context['request']
        # Faculty can only respond to feedback on their own subjects
        if value.subject.faculty != request.user:
            raise serializers.ValidationError("You can only respond to feedback on your own subjects.")
        if FeedbackResponse.objects.filter(feedback=value).exists():
            raise serializers.ValidationError("A response already exists for this feedback.")
        return value

    def create(self, validated_data):
        validated_data['faculty'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = (
            'id', 'subject', 'rating_teaching', 'rating_content',
            'rating_engagement', 'rating_overall', 'text_feedback',
            'is_anonymous', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def validate(self, data):
        request = self.context['request']
        if not request.user.is_student:
            raise serializers.ValidationError("Only students can submit feedback.")
        if Feedback.objects.filter(student=request.user, subject=data['subject']).exists():
            raise serializers.ValidationError("You have already submitted feedback for this subject.")
        return data

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackDetailSerializer(serializers.ModelSerializer):
    student_info = serializers.SerializerMethodField()
    subject_detail = SubjectListSerializer(source='subject', read_only=True)
    sentiment = serializers.SerializerMethodField()
    response = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = (
            'id', 'student_info', 'subject', 'subject_detail',
            'rating_teaching', 'rating_content', 'rating_engagement',
            'rating_overall', 'text_feedback', 'is_anonymous',
            'created_at', 'sentiment', 'response',
        )

    def get_student_info(self, obj):
        request = self.context.get('request')
        if request and (request.user == obj.student or request.user.is_admin_user):
            return UserMinimalSerializer(obj.student).data
        if obj.is_anonymous:
            return {"id": None, "username": "Anonymous", "full_name": "Anonymous Student"}
        return UserMinimalSerializer(obj.student).data

    def get_sentiment(self, obj):
        try:
            from analysis.serializers import SentimentResultSerializer
            return SentimentResultSerializer(obj.sentiment).data
        except Exception:
            return None

    def get_response(self, obj):
        try:
            return FeedbackResponseSerializer(obj.response).data
        except FeedbackResponse.DoesNotExist:
            return None

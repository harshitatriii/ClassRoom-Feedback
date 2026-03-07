from rest_framework import serializers

from accounts.serializers import UserMinimalSerializer
from courses.serializers import SubjectListSerializer
from .models import Feedback


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

    class Meta:
        model = Feedback
        fields = (
            'id', 'student_info', 'subject', 'subject_detail',
            'rating_teaching', 'rating_content', 'rating_engagement',
            'rating_overall', 'text_feedback', 'is_anonymous',
            'created_at', 'sentiment',
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

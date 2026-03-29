from rest_framework import serializers

from .models import SentimentResult


class SentimentResultSerializer(serializers.ModelSerializer):
    dominant_emotion = serializers.SerializerMethodField()

    class Meta:
        model = SentimentResult
        fields = (
            'id', 'feedback', 'polarity', 'subjectivity',
            'sentiment_label', 'keywords', 'category_scores',
            'aspect_sentiments', 'emotions', 'dominant_emotion',
            'processed_at',
        )
        read_only_fields = fields

    def get_dominant_emotion(self, obj):
        if not obj.emotions:
            return 'neutral'
        dominant = max(obj.emotions, key=obj.emotions.get)
        return dominant if obj.emotions.get(dominant, 0) > 0 else 'neutral'

from rest_framework import serializers

from .models import SentimentResult


class SentimentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SentimentResult
        fields = (
            'id', 'feedback', 'polarity', 'subjectivity',
            'sentiment_label', 'keywords', 'category_scores',
            'processed_at',
        )
        read_only_fields = fields

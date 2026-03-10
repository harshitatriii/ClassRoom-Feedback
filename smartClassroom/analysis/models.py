from django.db import models


class SentimentResult(models.Model):
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]

    feedback = models.OneToOneField(
        'feedback.Feedback',
        on_delete=models.CASCADE,
        related_name='sentiment',
    )
    polarity = models.FloatField(help_text='-1.0 to 1.0')
    subjectivity = models.FloatField(help_text='0.0 to 1.0')
    sentiment_label = models.CharField(max_length=10, choices=SENTIMENT_CHOICES)
    keywords = models.JSONField(default=list, blank=True)
    category_scores = models.JSONField(default=dict, blank=True)
    processed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sentiment for Feedback #{self.feedback_id}: {self.sentiment_label}"

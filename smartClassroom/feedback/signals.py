from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Feedback


@receiver(post_save, sender=Feedback)
def trigger_sentiment_analysis(sender, instance, created, **kwargs):
    if not created:
        return

    if not instance.text_feedback or not instance.text_feedback.strip():
        return

    from analysis.models import SentimentResult
    from analysis.sentiment import analyze_sentiment

    if SentimentResult.objects.filter(feedback=instance).exists():
        return

    result = analyze_sentiment(instance.text_feedback)

    SentimentResult.objects.create(
        feedback=instance,
        polarity=result['polarity'],
        subjectivity=result['subjectivity'],
        sentiment_label=result['sentiment_label'],
        keywords=result['keywords'],
        category_scores=result['category_scores'],
    )

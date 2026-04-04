from django.core.management.base import BaseCommand
from feedback.models import Feedback
from analysis.models import SentimentResult
from analysis.sentiment import full_analysis


class Command(BaseCommand):
    help = 'Run sentiment analysis on feedbacks that are missing results'

    def handle(self, *args, **options):
        feedbacks = Feedback.objects.filter(
            sentiment__isnull=True,
            text_feedback__isnull=False,
        ).exclude(text_feedback='')

        count = feedbacks.count()
        self.stdout.write(f'Found {count} feedbacks without sentiment analysis')

        for fb in feedbacks:
            try:
                result = full_analysis(fb.text_feedback)
                SentimentResult.objects.create(
                    feedback=fb,
                    polarity=result['polarity'],
                    subjectivity=result['subjectivity'],
                    sentiment_label=result['sentiment_label'],
                    keywords=result['keywords'],
                    category_scores=result['category_scores'],
                    aspect_sentiments=result['aspect_sentiments'],
                    emotions=result['emotions'],
                )
                self.stdout.write(f'  Analyzed feedback {fb.id}')
            except Exception as e:
                self.stderr.write(f'  Failed feedback {fb.id}: {e}')

        self.stdout.write(self.style.SUCCESS(f'Done! Processed {count} feedbacks'))

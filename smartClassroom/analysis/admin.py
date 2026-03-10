from django.contrib import admin

from .models import SentimentResult


@admin.register(SentimentResult)
class SentimentResultAdmin(admin.ModelAdmin):
    list_display = ('feedback', 'sentiment_label', 'polarity', 'subjectivity', 'processed_at')
    list_filter = ('sentiment_label',)
    readonly_fields = ('processed_at',)

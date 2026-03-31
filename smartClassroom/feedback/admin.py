from django.contrib import admin

from .models import Feedback, FeedbackResponse, FeedbackCampaign


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'rating_overall', 'is_anonymous', 'campaign', 'created_at')
    list_filter = ('is_anonymous', 'created_at', 'subject__program__school', 'campaign')
    search_fields = ('text_feedback', 'subject__name', 'subject__code')
    readonly_fields = ('created_at',)


@admin.register(FeedbackResponse)
class FeedbackResponseAdmin(admin.ModelAdmin):
    list_display = ('feedback', 'faculty', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('response_text', 'faculty__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FeedbackCampaign)
class FeedbackCampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'program', 'semester', 'is_mandatory', 'is_active', 'start_date', 'end_date')
    list_filter = ('is_mandatory', 'is_active', 'program')
    search_fields = ('title', 'description')

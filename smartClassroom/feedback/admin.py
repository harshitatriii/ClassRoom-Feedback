from django.contrib import admin

from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'rating_overall', 'is_anonymous', 'created_at')
    list_filter = ('is_anonymous', 'created_at', 'subject__program__school')
    search_fields = ('text_feedback', 'subject__name', 'subject__code')
    readonly_fields = ('created_at',)

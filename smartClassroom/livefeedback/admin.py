from django.contrib import admin
from .models import LiveSession, LivePulse, LiveQuestion, LiveQuestionVote


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ('session_code', 'display_name', 'session_type', 'faculty', 'is_active', 'started_at', 'ended_at')
    list_filter = ('is_active', 'session_type')
    search_fields = ('session_code', 'subject__code', 'title', 'faculty__username')


@admin.register(LivePulse)
class LivePulseAdmin(admin.ModelAdmin):
    list_display = ('session', 'reaction', 'student', 'created_at')
    list_filter = ('reaction',)


@admin.register(LiveQuestion)
class LiveQuestionAdmin(admin.ModelAdmin):
    list_display = ('session', 'student', 'text', 'is_anonymous', 'is_answered', 'created_at')
    list_filter = ('is_anonymous', 'is_answered')
    search_fields = ('text',)


@admin.register(LiveQuestionVote)
class LiveQuestionVoteAdmin(admin.ModelAdmin):
    list_display = ('question', 'student', 'created_at')

from django.contrib import admin
from .models import LiveSession, LivePulse


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ('session_code', 'subject', 'faculty', 'is_active', 'started_at', 'ended_at')
    list_filter = ('is_active',)
    search_fields = ('session_code', 'subject__code', 'faculty__username')


@admin.register(LivePulse)
class LivePulseAdmin(admin.ModelAdmin):
    list_display = ('session', 'reaction', 'student', 'created_at')
    list_filter = ('reaction',)

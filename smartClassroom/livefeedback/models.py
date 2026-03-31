import random
import string

from django.conf import settings
from django.db import models


def generate_session_code():
    """Generate a 6-character uppercase alphanumeric session code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class LiveSession(models.Model):
    """Represents an active class session where students can send live reactions."""
    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='live_sessions',
        limit_choices_to={'role': 'faculty'},
    )
    subject = models.ForeignKey(
        'courses.Subject',
        on_delete=models.CASCADE,
        related_name='live_sessions',
    )
    session_code = models.CharField(max_length=6, unique=True, default=generate_session_code)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        status = 'Active' if self.is_active else 'Ended'
        return f"[{status}] {self.subject.code} - {self.session_code}"


class LivePulse(models.Model):
    """Individual student reaction during a live session."""
    REACTION_CHOICES = [
        ('too_fast', 'Too Fast'),
        ('too_slow', 'Too Slow'),
        ('confused', 'Confused'),
        ('got_it', 'Got It'),
        ('interesting', 'Interesting'),
        ('boring', 'Boring'),
    ]

    session = models.ForeignKey(
        LiveSession,
        on_delete=models.CASCADE,
        related_name='pulses',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='live_pulses',
    )
    reaction = models.CharField(max_length=20, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reaction} at {self.created_at:%H:%M:%S}"

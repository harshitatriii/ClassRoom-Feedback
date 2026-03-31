import random
import string

from django.conf import settings
from django.db import models


def generate_session_code():
    """Generate a 6-character uppercase alphanumeric session code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class LiveSession(models.Model):
    """Represents an active class session where students can send live reactions."""

    SESSION_TYPE_CHOICES = [
        ('class', 'Class'),
        ('hackathon', 'Hackathon'),
        ('masterclass', 'Masterclass'),
        ('workshop', 'Workshop'),
        ('seminar', 'Seminar'),
        ('other', 'Other'),
    ]

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
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=200, blank=True, help_text='Custom title for non-subject sessions')
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES, default='class')
    session_code = models.CharField(max_length=6, unique=True, default=generate_session_code)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    @property
    def display_name(self):
        """Return subject name for class sessions, or custom title for others."""
        if self.subject:
            return self.subject.name
        return self.title or self.get_session_type_display()

    def __str__(self):
        status = 'Active' if self.is_active else 'Ended'
        label = self.subject.code if self.subject else (self.title or self.get_session_type_display())
        return f"[{status}] {label} - {self.session_code}"


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


class LiveQuestion(models.Model):
    """A question asked by a student during a live session."""
    session = models.ForeignKey(
        LiveSession,
        on_delete=models.CASCADE,
        related_name='questions',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='live_questions',
    )
    text = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    is_answered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        prefix = "Anon" if self.is_anonymous else (self.student.get_full_name() if self.student else "Unknown")
        return f"Q by {prefix}: {self.text[:50]}"


class LiveQuestionVote(models.Model):
    """Upvote on a live question — one per student per question."""
    question = models.ForeignKey(
        LiveQuestion,
        on_delete=models.CASCADE,
        related_name='votes',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='question_votes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['question', 'student']

    def __str__(self):
        return f"Vote by {self.student} on Q#{self.question_id}"

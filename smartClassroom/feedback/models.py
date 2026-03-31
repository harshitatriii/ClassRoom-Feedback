from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class FeedbackCampaign(models.Model):
    """A time-bound feedback collection period (e.g., semester-end mandatory feedback)."""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    program = models.ForeignKey(
        'courses.Program',
        on_delete=models.CASCADE,
        related_name='feedback_campaigns',
        null=True,
        blank=True,
        help_text='Target specific program. Leave blank for all programs.',
    )
    semester = models.IntegerField(
        null=True,
        blank=True,
        help_text='Target specific semester. Leave blank for all semesters.',
    )
    is_mandatory = models.BooleanField(default=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='campaigns_created',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    @property
    def is_open(self):
        from django.utils import timezone
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date

    def __str__(self):
        return f"{self.title} ({'Mandatory' if self.is_mandatory else 'Optional'})"


class Feedback(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks_given',
        limit_choices_to={'role': 'student'},
    )
    subject = models.ForeignKey(
        'courses.Subject',
        on_delete=models.CASCADE,
        related_name='feedbacks',
    )
    rating_teaching = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    rating_content = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    rating_engagement = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    rating_overall = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text_feedback = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=True)
    campaign = models.ForeignKey(
        FeedbackCampaign,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks',
        help_text='Campaign this feedback was submitted under (if any)',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['student', 'subject']

    def __str__(self):
        return f"Feedback by {self.student} for {self.subject.code}"


class FeedbackResponse(models.Model):
    feedback = models.OneToOneField(
        Feedback,
        on_delete=models.CASCADE,
        related_name='response',
    )
    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedback_responses',
        limit_choices_to={'role': 'faculty'},
    )
    response_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Response by {self.faculty} for Feedback #{self.feedback_id}"

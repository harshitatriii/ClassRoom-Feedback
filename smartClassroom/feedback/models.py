from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['student', 'subject']

    def __str__(self):
        return f"Feedback by {self.student} for {self.subject.code}"

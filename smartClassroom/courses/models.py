from django.conf import settings
from django.db import models


class School(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Program(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='programs',
    )
    total_semesters = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['school', 'code']

    def __str__(self):
        return f"{self.code} - {self.name} ({self.school.code})"


class Subject(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='subjects',
    )
    semester = models.IntegerField()
    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subjects_taught',
        limit_choices_to={'role': 'faculty'},
    )
    academic_year = models.CharField(max_length=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.name}"

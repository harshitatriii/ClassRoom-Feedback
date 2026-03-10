from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin', 'Admin'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    school = models.ForeignKey(
        'courses.School',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
    )
    program = models.ForeignKey(
        'courses.Program',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        help_text='For students only',
    )
    current_semester = models.IntegerField(
        null=True,
        blank=True,
        help_text='Current semester (for students only)',
    )
    enrollment_no = models.CharField(max_length=20, blank=True, help_text='For students only')
    faculty_id = models.CharField(max_length=20, blank=True, help_text='For faculty only')
    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def is_faculty(self):
        return self.role == 'faculty'

    @property
    def is_admin_user(self):
        return self.role == 'admin'

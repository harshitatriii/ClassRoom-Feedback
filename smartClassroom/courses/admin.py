from django.contrib import admin

from .models import School, Program, Subject


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active')
    search_fields = ('name', 'code')


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'school', 'total_semesters', 'is_active')
    list_filter = ('school', 'is_active')
    search_fields = ('name', 'code')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'program', 'semester', 'faculty', 'academic_year', 'is_active')
    list_filter = ('program__school', 'program', 'semester', 'is_active', 'academic_year')
    search_fields = ('name', 'code')

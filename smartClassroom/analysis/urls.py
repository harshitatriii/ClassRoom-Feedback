from django.urls import path

from .views import (
    DashboardStatsView, SubjectSentimentView, SchoolAnalyticsView,
    ExportFeedbackCSVView, ExportSubjectReportCSVView,
)

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('analysis/subject/<int:subject_id>/', SubjectSentimentView.as_view(), name='subject-sentiment'),
    path('analysis/school/', SchoolAnalyticsView.as_view(), name='school-analytics'),
    path('export/feedback/', ExportFeedbackCSVView.as_view(), name='export-feedback-csv'),
    path('export/subjects/', ExportSubjectReportCSVView.as_view(), name='export-subjects-csv'),
]

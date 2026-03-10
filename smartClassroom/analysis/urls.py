from django.urls import path

from .views import DashboardStatsView, SubjectSentimentView, SchoolAnalyticsView

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('analysis/subject/<int:subject_id>/', SubjectSentimentView.as_view(), name='subject-sentiment'),
    path('analysis/school/', SchoolAnalyticsView.as_view(), name='school-analytics'),
]

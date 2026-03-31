from django.urls import path

from .views import (
    StartSessionView, EndSessionView, ActiveSessionView,
    JoinSessionView, SubmitPulseView, SessionDashboardView,
    SessionHistoryView,
)

urlpatterns = [
    path('live/start/', StartSessionView.as_view(), name='live-start'),
    path('live/end/<int:session_id>/', EndSessionView.as_view(), name='live-end'),
    path('live/active/', ActiveSessionView.as_view(), name='live-active'),
    path('live/join/', JoinSessionView.as_view(), name='live-join'),
    path('live/pulse/', SubmitPulseView.as_view(), name='live-pulse'),
    path('live/dashboard/<int:session_id>/', SessionDashboardView.as_view(), name='live-dashboard'),
    path('live/history/', SessionHistoryView.as_view(), name='live-history'),
]

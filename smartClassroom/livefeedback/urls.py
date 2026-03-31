from django.urls import path

from .views import (
    StartSessionView, EndSessionView, ActiveSessionView,
    JoinSessionView, SubmitPulseView, SessionDashboardView,
    SessionStudentsView, SessionHistoryView,
    SubmitQuestionView, ListQuestionsView, UpvoteQuestionView,
    MarkQuestionAnsweredView,
)

urlpatterns = [
    path('live/start/', StartSessionView.as_view(), name='live-start'),
    path('live/end/<int:session_id>/', EndSessionView.as_view(), name='live-end'),
    path('live/active/', ActiveSessionView.as_view(), name='live-active'),
    path('live/join/', JoinSessionView.as_view(), name='live-join'),
    path('live/pulse/', SubmitPulseView.as_view(), name='live-pulse'),
    path('live/dashboard/<int:session_id>/', SessionDashboardView.as_view(), name='live-dashboard'),
    path('live/students/<int:session_id>/', SessionStudentsView.as_view(), name='live-students'),
    path('live/questions/', SubmitQuestionView.as_view(), name='live-question-submit'),
    path('live/questions/<int:session_id>/', ListQuestionsView.as_view(), name='live-question-list'),
    path('live/questions/<int:question_id>/upvote/', UpvoteQuestionView.as_view(), name='live-question-upvote'),
    path('live/questions/<int:question_id>/answered/', MarkQuestionAnsweredView.as_view(), name='live-question-answered'),
    path('live/history/', SessionHistoryView.as_view(), name='live-history'),
]

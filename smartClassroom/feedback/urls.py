from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FeedbackViewSet, FeedbackResponseViewSet, CampaignViewSet,
    CampaignStudentStatusView, CampaignCompletionView,
)

router = DefaultRouter()
router.register('feedback', FeedbackViewSet, basename='feedback')
router.register('feedback-responses', FeedbackResponseViewSet, basename='feedback-response')
router.register('campaigns', CampaignViewSet, basename='campaign')

urlpatterns = [
    # Custom campaign paths BEFORE router — otherwise router's campaigns/<pk>/ swallows them
    path('campaigns/my-status/', CampaignStudentStatusView.as_view(), name='campaign-student-status'),
    path('campaigns/<int:campaign_id>/completion/', CampaignCompletionView.as_view(), name='campaign-completion'),
    path('', include(router.urls)),
]

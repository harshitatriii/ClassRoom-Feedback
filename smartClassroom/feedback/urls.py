from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import FeedbackViewSet, FeedbackResponseViewSet

router = DefaultRouter()
router.register('feedback', FeedbackViewSet, basename='feedback')
router.register('feedback-responses', FeedbackResponseViewSet, basename='feedback-response')

urlpatterns = [
    path('', include(router.urls)),
]

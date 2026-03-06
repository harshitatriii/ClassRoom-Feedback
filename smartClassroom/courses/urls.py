from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import SchoolViewSet, ProgramViewSet, SubjectViewSet

router = DefaultRouter()
router.register('schools', SchoolViewSet, basename='school')
router.register('programs', ProgramViewSet, basename='program')
router.register('subjects', SubjectViewSet, basename='subject')

urlpatterns = [
    path('', include(router.urls)),
]

from collections import defaultdict
from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsFacultyOrAdmin
from .models import LiveSession, LivePulse
from .serializers import LiveSessionSerializer, LivePulseSerializer


class StartSessionView(APIView):
    """Faculty starts a new live session for a subject."""
    permission_classes = [IsFacultyOrAdmin]

    def post(self, request):
        subject_id = request.data.get('subject')
        if not subject_id:
            return Response({'detail': 'subject is required.'}, status=400)

        # End any existing active sessions for this faculty
        LiveSession.objects.filter(
            faculty=request.user, is_active=True
        ).update(is_active=False, ended_at=timezone.now())

        session = LiveSession.objects.create(
            faculty=request.user,
            subject_id=subject_id,
        )
        return Response(LiveSessionSerializer(session).data, status=201)


class EndSessionView(APIView):
    """Faculty ends an active live session."""
    permission_classes = [IsFacultyOrAdmin]

    def post(self, request, session_id):
        try:
            session = LiveSession.objects.get(pk=session_id, faculty=request.user)
        except LiveSession.DoesNotExist:
            return Response({'detail': 'Session not found.'}, status=404)

        session.is_active = False
        session.ended_at = timezone.now()
        session.save()
        return Response(LiveSessionSerializer(session).data)


class ActiveSessionView(APIView):
    """Get the faculty's current active session, if any."""
    permission_classes = [IsFacultyOrAdmin]

    def get(self, request):
        session = LiveSession.objects.filter(
            faculty=request.user, is_active=True
        ).select_related('subject').first()

        if not session:
            return Response({'active': False})

        return Response({
            'active': True,
            'session': LiveSessionSerializer(session).data,
        })


class JoinSessionView(APIView):
    """Student joins a live session by entering the session code."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('session_code', '').strip().upper()
        if not code:
            return Response({'detail': 'session_code is required.'}, status=400)

        try:
            session = LiveSession.objects.get(session_code=code, is_active=True)
        except LiveSession.DoesNotExist:
            return Response({'detail': 'Invalid or expired session code.'}, status=404)

        return Response({
            'session': LiveSessionSerializer(session).data,
        })


class SubmitPulseView(APIView):
    """Student submits a live reaction pulse."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session')
        reaction = request.data.get('reaction')

        if not session_id or not reaction:
            return Response({'detail': 'session and reaction are required.'}, status=400)

        valid_reactions = [c[0] for c in LivePulse.REACTION_CHOICES]
        if reaction not in valid_reactions:
            return Response({'detail': f'Invalid reaction. Choose from: {valid_reactions}'}, status=400)

        try:
            session = LiveSession.objects.get(pk=session_id, is_active=True)
        except LiveSession.DoesNotExist:
            return Response({'detail': 'Session not found or has ended.'}, status=404)

        # Rate limit: max 1 pulse per 5 seconds per student per session
        recent = LivePulse.objects.filter(
            session=session,
            student=request.user,
            created_at__gte=timezone.now() - timedelta(seconds=5),
        ).exists()

        if recent:
            return Response({'detail': 'Please wait a few seconds before sending another reaction.'}, status=429)

        pulse = LivePulse.objects.create(
            session=session,
            student=request.user if request.user.is_authenticated else None,
            reaction=reaction,
        )
        return Response(LivePulseSerializer(pulse).data, status=201)


class SessionDashboardView(APIView):
    """
    Real-time dashboard data for a live session.
    Returns aggregated pulse counts, timeline data, and recent pulses.
    Faculty polls this endpoint every few seconds.
    """
    permission_classes = [IsFacultyOrAdmin]

    def get(self, request, session_id):
        try:
            session = LiveSession.objects.get(pk=session_id)
        except LiveSession.DoesNotExist:
            return Response({'detail': 'Session not found.'}, status=404)

        if request.user.role == 'faculty' and session.faculty != request.user:
            return Response({'detail': 'Not your session.'}, status=403)

        pulses = session.pulses.all()

        # Overall reaction distribution
        reaction_counts = dict(
            pulses.values('reaction').annotate(count=Count('id')).values_list('reaction', 'count')
        )
        # Ensure all reactions present
        for choice, _ in LivePulse.REACTION_CHOICES:
            reaction_counts.setdefault(choice, 0)

        # Timeline: group pulses into 30-second buckets
        timeline = _build_timeline(pulses, session.started_at)

        # Recent pulses (last 20)
        recent = LivePulseSerializer(pulses[:20], many=True).data

        # Unique student count
        student_count = pulses.values('student').distinct().count()

        return Response({
            'session': LiveSessionSerializer(session).data,
            'reaction_counts': reaction_counts,
            'timeline': timeline,
            'recent_pulses': recent,
            'total_pulses': pulses.count(),
            'student_count': student_count,
        })


class SessionHistoryView(APIView):
    """List past sessions for a faculty member."""
    permission_classes = [IsFacultyOrAdmin]

    def get(self, request):
        sessions = LiveSession.objects.filter(faculty=request.user).select_related('subject')
        data = LiveSessionSerializer(sessions[:20], many=True).data
        return Response(data)


def _build_timeline(pulses, session_start, bucket_seconds=30):
    """Group pulses into time buckets for timeline visualization."""
    buckets = defaultdict(lambda: defaultdict(int))

    for pulse in pulses:
        elapsed = (pulse.created_at - session_start).total_seconds()
        bucket_idx = int(elapsed // bucket_seconds)
        bucket_label = f"{bucket_idx * bucket_seconds // 60:.0f}:{bucket_idx * bucket_seconds % 60:02.0f}"
        buckets[bucket_label][pulse.reaction] += 1

    timeline = []
    for label in sorted(buckets.keys(), key=lambda x: [int(p) for p in x.split(':')]):
        entry = {'time': label}
        entry.update(buckets[label])
        timeline.append(entry)

    return timeline

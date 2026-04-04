import requests as http_requests

from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CustomUser
from .serializers import (
    ALLOWED_EMAIL_DOMAINS,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Faculty accounts need admin approval before login
        if user.role == 'faculty':
            return Response({
                'detail': 'Faculty account created. Please wait for admin approval before logging in.',
                'requires_approval': True,
            }, status=status.HTTP_201_CREATED)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserProfileSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserProfileSerializer(user).data,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class MicrosoftLoginView(APIView):
    """
    Accepts a Microsoft access token from the frontend,
    verifies it via Microsoft Graph API, and returns an app token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        ms_token = request.data.get('access_token')
        if not ms_token:
            return Response(
                {'detail': 'Microsoft access token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Call Microsoft Graph API to get user profile
        graph_response = http_requests.get(
            'https://graph.microsoft.com/v1.0/me',
            headers={'Authorization': f'Bearer {ms_token}'},
            timeout=10,
        )

        if graph_response.status_code != 200:
            return Response(
                {'detail': 'Invalid Microsoft token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        ms_user = graph_response.json()
        email = (ms_user.get('mail') or ms_user.get('userPrincipalName', '')).lower()
        first_name = ms_user.get('givenName', '')
        last_name = ms_user.get('surname', '')

        if not email:
            return Response(
                {'detail': 'Could not retrieve email from Microsoft account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify email domain
        domain = email.split('@')[-1]
        if domain not in ALLOWED_EMAIL_DOMAINS:
            return Response(
                {'detail': f'Only university emails (@{", @".join(ALLOWED_EMAIL_DOMAINS)}) are allowed.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Find or create user
        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            # Auto-create student account (faculty still needs manual setup)
            username = email.split('@')[0]
            # Ensure unique username
            base_username = username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f'{base_username}{counter}'
                counter += 1

            user = CustomUser(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role='student',
            )
            user.set_unusable_password()
            user.save()

            return Response({
                'detail': 'Account created via Microsoft. Please complete your profile to continue.',
                'requires_profile': True,
                'token': Token.objects.get_or_create(user=user)[0].key,
                'user': UserProfileSerializer(user).data,
            }, status=status.HTTP_201_CREATED)

        if not user.is_active:
            return Response(
                {'detail': 'Your account is pending admin approval.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserProfileSerializer(user).data,
        })

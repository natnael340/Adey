from typing import Any, List

from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from adey_apps.users.models import User, Plan
from adey_apps.users.serializers import UserLoginSerializer, UserSerializer, PlanSerializer


# Create your views here.


class LoginView(GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    authentication_classes: List[Any] = []

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                    {"error": 1, "message": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        user = serializer.validated_data["user"]

        token = RefreshToken.for_user(user)
        return Response(
                    {"error": 0, "token": str(token.access_token), "refresh": str(token)},
                    status=status.HTTP_200_OK,
                )
    


class SignUpView(GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    authentication_classes: List[Any] = []

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"error": 0, "message": "User registered successfully."})



class GoogleLogin(SocialLoginView): 
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000"
    client_class = OAuth2Client


class PlanViewSet(ReadOnlyModelViewSet):
    serializer_class = PlanSerializer
    permission_classes = (AllowAny,)
    queryset = Plan.objects.all()
    lookup_field = "name"
    lookup_url_kwarg = "name"
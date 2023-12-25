from typing import Any, List

from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from adey_apps.users.models import User
from adey_apps.users.serializers import UserLoginSerializer, UserSerializer


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


from typing import Any, List
from datetime import datetime
from dateutil.relativedelta import relativedelta

from rest_framework import status
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from django_filters import rest_framework as filters
from django.core.exceptions import BadRequest
from adey_apps.users.models import User, Plan, Subscription
from adey_apps.users.serializers import UserLoginSerializer, UserSerializer, PlanSerializer, SubscriptionSerializer


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
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('period',)
    queryset = Plan.objects.all().order_by("price")
    lookup_field = "name"
    lookup_url_kwarg = "name"

class SubscriptionApiView(RetrieveAPIView, GenericAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = SubscriptionSerializer

    def get_object(self):
        return self.request.user.subscription
        

class Subscribe(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        plan_name = kwargs.get("plan")
        plan_period = kwargs.get("period")

        if plan_period not in [Plan.YEARLY, Plan.MONTHLY]:
            return Response({"message": f"period must be either {Plan.MONTHLY} or {Plan.YEARLY}."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = Plan.objects.get(name=plan_name, period=plan_period)
            end_at = None
            if plan.name != "Basic":
                if plan_period == Plan.MONTHLY:
                    end_at = datetime.today() + relativedelta(months=1)
                elif plan_period == Plan.YEARLY:
                    end_at = datetime.today() + relativedelta(years=1)

            subscription = request.user.subscription
            subscription.plan = plan
            subscription.end_at = end_at
            
            subscription.save()

            return Response({"message": f"User subscribed to {plan_name} {plan_period} successfully."}, status=status.HTTP_200_OK)
        
        except Plan.DoesNotExist:
            return Response({"message": f"Plan with {plan_name} does not exist."}, status=status.HTTP_400_BAD_REQUEST)

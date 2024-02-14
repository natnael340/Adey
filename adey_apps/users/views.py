import stripe
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
from django.conf import settings
from adey_apps.users.models import User, Plan, Subscription
from adey_apps.users.serializers import UserLoginSerializer, UserSerializer, PlanSerializer, SubscriptionSerializer


stripe.api_key = settings.STRIPE_SECRET_TEST_KEY


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
        identifier = kwargs.get("identifier")

        try:
            plan = Plan.objects.get(identifier=identifier)
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        "price": plan.stripe_price_id,
                        "quantity": 1,
                    }
                ],
                mode="subscription",
                success_url="http://127.0.0.1:3000/subscription/success?checkout_id={CHECKOUT_SESSION_ID}",
                cancel_url="http://127.0.0.1:3000/subscription/error",
            )

            """subscription = request.user.subscription
            subscription.plan = plan
            
            subscription.save()"""
            

            return Response({"plan": {"name": plan.name, "period": plan.period}, "redirect_url": checkout_session.url}, status=status.HTTP_200_OK)
        
        except Plan.DoesNotExist:
            return Response({"message": f"Plan with this identifier does not exist."}, status=status.HTTP_400_BAD_REQUEST)


class VerifySubscription(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        checkout_id = kwargs.get('checkout_id')
        checkout_session = stripe.checkout.Session.retrieve(checkout_id)

        if checkout_session:
            price_id = checkout_session.line_items[0].price.id
            try:
                plan = Plan.objects.get(stripe_price_id=price_id)
                subscription = request.user.subscription
                subscription.plan = plan
                subscription.save(update_field=["plan"])

                return Response({"message": f"Successfully subscribed to {plan.name} - {plan.period} plan.", "error": False}, status=status.HTTP_200_OK)
            except Plan.DoesNotExist:
                return Response({"message": "Server error.", "error": True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"message": "Invalid checkout id.", "error": True}, status=status.HTTP_400_BAD_REQUEST)



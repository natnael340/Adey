import stripe
import requests
import base64
import json
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
from adey_apps.users.models import User, Plan, Subscription, SubscriptionOrder
from adey_apps.users.serializers import UserLoginSerializer, UserSerializer, PlanSerializer, SubscriptionSerializer
from adey_apps.users.utils import get_subscription, generate_access_token, create_subscription


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
    lookup_field = "identifier"
    lookup_url_kwarg = "identifier"

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
            token = generate_access_token(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET)
            response, status_code = create_subscription(token, plan)
            if response.get("id", None):
                SubscriptionOrder.objects.create(order_id=response.get("id"), user=request.user)

            return Response(response, status=status_code)
        except Plan.DoesNotExist:
            return Response({"message": f"Plan with this identifier does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        except requests.RequestException as e:
            return Response({"message": e.__str__()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"message": f"Other exception: {e.__str__()}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class VerifySubscription(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        checkout_id = kwargs.get('checkout_id')
        try:
            token = generate_access_token(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET)
            response, status_code = get_subscription(token, checkout_id)
            
            if status_code == 200:
                plan = Plan.objects.get(paypal_price_id=response.get("plan_id"))
                sub = request.user.subscription
                sub.plan = plan
                sub.paypal_order_id =  response.get("id")   
                sub.save(update_fields=["plan", "paypal_order_id"])
                
                return Response({"message": f"Successfully subscribed to {plan.name} - {plan.period} plan.", "error": False}, status=status.HTTP_200_OK)
            return Response({"error": True, "data": response}, status=status_code)
        except requests.RequestException as e:
            return Response({"message": e.__str__(), "error": True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"message": f"Other exception: {e.__str__()}", "error": True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        



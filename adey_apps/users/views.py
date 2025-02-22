import logging
import requests

from typing import Any, List
from datetime import datetime, timedelta

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
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from adey_apps.users.models import User, Plan, Subscription, SubscriptionOrder, TokenGenerationLog
from adey_apps.users.serializers import UserLoginSerializer, UserSerializer, PlanSerializer, SubscriptionSerializer, EmailVerificationSerializer, PasswordResetSerializer
from adey_apps.users.utils import get_subscription, generate_access_token, create_subscription, AESCipher, send_email_verification_email, send_password_reset_email
from adey_apps.users.tokens import account_activation_token


logger = logging.getLogger(__name__)


class LoginView(GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]  

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(
                    {"error": 1, "message": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        user = serializer.validated_data["user"]

        if not user.is_verified:
            return Response(
                    {"error": 1, "message": "Account has not be verified."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        token = RefreshToken.for_user(user)
        return Response(
                    {"error": 0, "token": str(token.access_token), "refresh": str(token)},
                    status=status.HTTP_200_OK,
                )
    


class SignUpView(GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        send_email_verification_email(user, request)

        return Response({"error": 0, "message": "Email Activation link is sent to your email."})


class EmailVerificationRequestView(GenericAPIView):
    serializer_class = EmailVerificationSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ip_address = self.request.META.get('REMOTE_ADDR')

        try:
            user = User.objects.get(email=serializer.validated_data["email"])
            if user.is_verified:
                return Response({"error": 1, "message": "User already verified."})
        except User.DoesNotExist:
            logger.warning(f"IP: {ip_address}, Error: User with {serializer.validated_data['email']} doesn't exist.")
        else:
            recent_requests = TokenGenerationLog.objects.filter(
                ip_address=ip_address, created__gte=datetime.now() - timedelta(hours=1), token_type=TokenGenerationLog.EMAIL
            ).count()
            if recent_requests >= 3:
                return Response({"error": 1, "message": "Too many request. Please try again later."})
            
            send_email_verification_email(user, request)
            TokenGenerationLog.objects.create(ip_address=ip_address, token_type=TokenGenerationLog.EMAIL)

        return Response({
            "error": 0, 
            "message": "An activation link will be sent to your email shortly if you have an account with us."
        })


class EmailVerificationView(GenericAPIView):
    serializer_class = None
    permission_classes = [AllowAny]

    def get(self, request, token: str):
        token = token.replace("_", "/") 
        try:
            token_dec = AESCipher().decrypt(token)
        except Exception as e:
            logger.warning(e.__str__())
            return Response({"error": 1, "message": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

        token, identifier = token_dec.split(":")
        user = User.objects.get(identifier=identifier)
        if not account_activation_token.check_token(user, token):
            return Response({"error": 1, "message": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_verified = True
        user.save(update_fields=["is_verified"])

        return Response({
            "error": 0, 
            "message": "Your account has been successfully verified."
        })
    

class PasswordResetView(GenericAPIView):
    serializer_class = EmailVerificationSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ip_address = self.request.META.get('REMOTE_ADDR')

        try:
            user = User.objects.get(email=serializer.validated_data["email"])
        except User.DoesNotExist:
            logger.warning(f"IP: {ip_address}, Error: User with {serializer.validated_data['email']} doesn't exist.")
        else:
            recent_requests = TokenGenerationLog.objects.filter(
                ip_address=ip_address, created__gte=datetime.now() - timedelta(hours=1), token_type=TokenGenerationLog.PASSWORD
            ).count()
            if recent_requests >= 3:
                return Response({"error": 1, "message": "Too many request. Please try again later."})
            
            send_password_reset_email(user, request)
            TokenGenerationLog.objects.create(ip_address=ip_address, token_type=TokenGenerationLog.PASSWORD)

        return Response({
            "error": 0, 
            "message": "A password reset link will be sent to your email shortly if you have an account with us."
        })


class PasswordResetConfirmView(GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [AllowAny]

    def post(self, request, token):
        token = token.replace("_", "/") 
        try:
            token_dec = AESCipher().decrypt(token)
        except Exception as e:
            logger.warning(e.__str__())
            return Response({"error": 1, "message": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

        token, identifier = token_dec.split(":")
        user = User.objects.get(identifier=identifier)
        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"error": 1, "message": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)


        return Response({
            "error": 0, 
            "message": "A password reset successful."
        })

        
        

class GoogleLogin(SocialLoginView): 
    adapter_class = GoogleOAuth2Adapter
    callback_url = f"{'https' if settings.TLS_ENABLED else 'http'}://{settings.FRONTEND_DOMAIN}"
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
        except Exception as e:
            logger.error(e.__str__())
            return Response({"message": f"Server Error!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
        



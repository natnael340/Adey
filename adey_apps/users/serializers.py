from typing import Any, Dict

from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import update_last_login
from django.core.validators import RegexValidator
from django.urls import reverse
from django.conf import settings
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers, exceptions
from adey_apps.users.models import User, Plan, Subscription



class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=256, required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        user = authenticate(self.context.get("request"), email=attrs.get("email"), password=attrs.get("password"))

        if not user:
            raise serializers.ValidationError("Invalid email or password")
        
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password')

    def validate_email(self, email):
        email = super().validate(email)
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email address taken.")
        
        return email

    def create(self, validated_data: Dict[str, str]) -> User:
        user = User.objects.create(email=validated_data.get("email"))
        user.set_password(validated_data["password"])
        user.save()

        return user



class UserReadSerializer(serializers.Serializer):
    email = serializers.EmailField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)


class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, write_only=True)


class PasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs.get('password') != attrs.get("confirm_password"):
            raise serializers.ValidationError("password and confirm password do not match")
        
        return super().validate(attrs)

    def save(self, user, **kwargs):
        user.set_password(self.validated_data["password"])
        user.save()


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = (
            "identifier",
            "name", 
            "period", 
            "max_chatbot", 
            "max_webapp_per_bot", 
            "max_request_per_month", 
            "max_user_session", 
            "price",
        )


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer()
    class Meta:
        model = Subscription
        fields = (
            "plan",
            "end_at",
            "status",
        )


class AdTokenObtainPairSerializer(TokenObtainSerializer):
    """
    Override serializer to raise error when a user is not verified
    """
    token_class = RefreshToken
    default_error_messages = {
        "unverified_account": _("This account email is not verified."),
    }

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data = super().validate(attrs)

        if not self.user.is_verified:
            raise exceptions.AuthenticationFailed(
                self.error_messages["unverified_account"],
                "unverified_account",
            )
        
        refresh = self.get_token(self.user)

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        if settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data
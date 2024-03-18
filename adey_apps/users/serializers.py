from typing import Any, Dict

from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth import authenticate
from django.core.validators import RegexValidator
from django.urls import reverse

from rest_framework import serializers
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


class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, write_only=True)



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
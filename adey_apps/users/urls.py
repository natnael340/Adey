from django.urls import path

from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView
from adey_apps.users.views import (
    LoginView, 
    SignUpView, 
    GoogleLogin, 
    PlanViewSet, 
    SubscriptionApiView, 
    Subscribe,
    VerifySubscription,
    EmailVerificationRequestView,
    EmailVerificationView,
    PasswordResetView,
    PasswordResetConfirmView,
)


router = routers.DefaultRouter()

urlpatterns = [
    path("auth/login", LoginView.as_view(), name="user_login"),
    path("auth/social/google", GoogleLogin.as_view(), name="google_login"),
    path("auth/signup", SignUpView.as_view(), name="user_signup"),
    path("auth/email/verification", EmailVerificationRequestView.as_view(), name="email_verification_request"),
    path("auth/email/verify/<token>", EmailVerificationView.as_view(), name="verify_email"),
    path("auth/password/reset", PasswordResetView.as_view(), name="password_reset_request"),
    path("auth/password/reset/<token>", PasswordResetConfirmView.as_view(), name="reset_password"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user/subscription", SubscriptionApiView.as_view(), name="user_subscription"),
    path("user/subscribe/<uuid:identifier>", Subscribe.as_view(), name="subscribe"),
    path("user/subscription/check/<str:checkout_id>", VerifySubscription.as_view(), name="verify_sub"),
]

router.register("plans", PlanViewSet, "plans")

urlpatterns += router.urls
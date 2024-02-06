from django.urls import path

from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView
from adey_apps.users.views import LoginView, SignUpView, GoogleLogin, PlanViewSet, SubscriptionApiView


router = routers.DefaultRouter()

urlpatterns = [
    path("auth/login", LoginView.as_view(), name="user_login"),
    path("auth/social/google", GoogleLogin.as_view(), name="google_login"),
    path("auth/signup", SignUpView.as_view(), name="user_signup"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user/subscription", SubscriptionApiView.as_view(), name="user_subscription"),
]

router.register("plans", PlanViewSet, "plans")

urlpatterns += router.urls
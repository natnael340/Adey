from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView
from adey_apps.users.views import LoginView, SignUpView

urlpatterns = [
    path("auth/login", LoginView.as_view(), name="user_login"),
    path("auth/signup", SignUpView.as_view(), name="user_signup"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

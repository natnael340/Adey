from typing import Iterable, Optional
from uuid import uuid4

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils.encoding import force_str

from adey_apps.adey_commons.models import BaseModel


# Create your models here.

def get_default_subscription():
    return Subscription.objects.first().pk


class UserManager(BaseUserManager["User"]):
    def create_user(self, email: str, password: Optional[str] = None) -> "User":
        if not email:
            raise ValidationError("Email can't be empty.")
        email = self.normalize_email(email)
        user = self.model(email=email)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: Optional[str] = None) -> "User":
        if not email:
            raise ValidationError("Email can't be empty.")

        email = self.normalize_email(email)
        user = self.model(email=email)
        user.is_superuser = True
        user.is_staff = True
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    identifier = models.UUIDField(
        "Identifier", unique=True, db_index=True, editable=False, default=uuid4
    )
    email = models.EmailField("Email", max_length=255, unique=True)
    is_staff = models.BooleanField("IsStaff", default=False)
    is_superuser = models.BooleanField("IsSuperuser", default=False)
    
    objects = UserManager()

    USERNAME_FIELD = "email"

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self) -> str:
        return self.email



class Plan(BaseModel):
    YEARLY, MONTHLY = "yearly", "monthly"
    PERIOD_OPTIONS = ((YEARLY, YEARLY), (MONTHLY, MONTHLY))

    name = models.CharField("Plan Name", max_length=256)
    period = models.CharField("Plan Period", choices=PERIOD_OPTIONS)
    max_chatbot = models.IntegerField()
    max_webapp_per_bot = models.IntegerField()
    max_request_per_month = models.IntegerField()
    max_user_session = models.IntegerField()
    price = models.DecimalField(decimal_places=2, max_digits=5)

    def __str__(self):
        return f"{self.name} - {self.period}"
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("name", "period"), name="unique_together_name_period",
            )
        ]


class Subscription(BaseModel):
    CANCELED, ACTIVE = "canceled", "active"
    PLAN_OPTIONS = ((CANCELED, CANCELED), (ACTIVE, ACTIVE))

    user = models.OneToOneField(User, related_name="subscription", on_delete=models.CASCADE)
    plan = models.ForeignKey(verbose_name="Plan", to=Plan, on_delete=models.CASCADE)
    end_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=8, choices=PLAN_OPTIONS, default=ACTIVE)
    stripe_customer_id = models.CharField(max_length=256, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=256, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.user} : {self.plan}"

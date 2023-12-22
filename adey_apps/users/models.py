from typing import Iterable, Optional
from uuid import uuid4

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils.encoding import force_str


# Create your models here.


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
        return force_str(self.identifier)


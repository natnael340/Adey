from adey_apps.users.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from six import text_type


class TokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user: User, timestamp: int):
        return (text_type(user.pk) + text_type(timestamp) + text_type(user.is_verified))
    

account_activation_token = TokenGenerator()
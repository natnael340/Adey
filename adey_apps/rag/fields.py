import json

from cryptography.fernet import Fernet
from django.conf import settings
from django.db import models


class EncryptedJSONField(models.TextField):
    def get_prep_value(self, value):
        return Fernet(settings.TOOL_CONFIG_KEY).encrypt(json.dumps(value).encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return json.loads(Fernet(settings.TOOL_CONFIG_KEY).decrypt(value.encode()))

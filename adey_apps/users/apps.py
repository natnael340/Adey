from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'adey_apps.users'

    def ready(self) -> None:
        import adey_apps.users.signals

from django.contrib import admin
from adey_apps.users.models import User, Plan, Subscription
# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "is_staff", "is_superuser")

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("identifier", "name", "period", "price")


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "end_at")


        
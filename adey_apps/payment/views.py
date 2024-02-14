import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from adey_apps.users.models import Plan
# Create your views here.


class CheckoutApiView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            plan = Plan.objects.get(name=kwargs.get("name"), period=kwargs.get("period"))

            return Response({"status": "OK", "subscription": plan.stripe_price_id})
        except Plan.DoesNotExist:
            return Response({"status": "error"})

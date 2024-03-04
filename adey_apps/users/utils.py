import base64
import json
from django.conf import settings
import requests
from adey_apps.users.models import Plan

def getAuthAssertionValue(clientID, payerID):
    header = {
        "alg": "none",
    }
    encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode("utf-8"))
    payload = {
        "iss": clientID,
        "payer_id": payerID
    }
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8"))

    return f"{encoded_header.decode('utf-8')}.{encoded_payload.decode('utf-8')}"
    

def generate_access_token(clientId, clientSecret):
    auth = base64.b64encode(f"{clientId}:{clientSecret}".encode('utf-8'))

    response = requests.post("https://api-m.sandbox.paypal.com/v1/oauth2/token", data="grant_type=client_credentials", headers={
        "Authorization": f"Basic {auth.decode('utf-8')}"
    })
    response = response.json()

    return response.get("access_token", None)

def create_subscription(token, plan: Plan):
    response = requests.post("https://api-m.sandbox.paypal.com/v1/billing/subscriptions", json={
        "plan_id": plan.paypal_price_id,
        "application_context": {
            "user_action": "SUBSCRIBE_NOW",
      }
    }, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Prefer": "return=representation",
    })

    return [response.json(), response.status_code]


def get_subscription(token: str, id):
    print(token)
    response = requests.get(f"https://api-m.sandbox.paypal.com/v1/billing/subscriptions/{id}", 
        headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    })
    data = response.json()
    print("data", data)
    return [data, response.status_code]
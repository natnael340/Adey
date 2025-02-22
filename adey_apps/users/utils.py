import base64
import json
import requests
import urllib.parse

import hashlib
from Crypto import Random
from Crypto.Cipher import AES

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from adey_apps.users.models import Plan
from adey_apps.users.tokens import account_activation_token



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
   
    response = requests.get(f"https://api-m.sandbox.paypal.com/v1/billing/subscriptions/{id}", 
        headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    })
    data = response.json()
    return [data, response.status_code]


class AESCipher(object):

    def __init__(self):
        self.bs = AES.block_size
        self.key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()

    def encrypt(self, raw):
        raw = self._pad(raw)
        iv = Random.new().read(AES.block_size)
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return base64.b64encode(iv + cipher.encrypt(raw.encode()))

    def decrypt(self, enc):
        enc = base64.b64decode(enc)
        iv = enc[:AES.block_size]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return AESCipher._unpad(cipher.decrypt(enc[AES.block_size:])).decode('utf-8')

    def _pad(self, s):
        return s + (self.bs - len(s) % self.bs) * chr(self.bs - len(s) % self.bs)

    @staticmethod
    def _unpad(s):
        return s[:-ord(s[len(s)-1:])]


def send_act_email(to_email: str, url: str) -> None:
    context = {
        "email_verification_url": url,
        "btn_txt": "Verify Email",
        "title": "Please Verify your email address"
    }

    email_subject = "Verify Email"
    email_body = render_to_string("email_template.html", context)
    plain_message = strip_tags(email_body)
    
    send_mail(
        email_subject,
        plain_message,
        settings.EMAIL_HOST_USER,
        [
            to_email,
        ],
        html_message=email_body,
    )


def send_pwd_email(to_email: str, url: str) -> None:
    context = {
        "email_verification_url": url,
        "btn_txt": "Reset Password",
        "title": "Please click this button to reset your password."
    }

    email_subject = "Reset Password"
    email_body = render_to_string("email_template.html", context)
    plain_message = strip_tags(email_body)
    send_mail(
        email_subject,
        plain_message,
        settings.EMAIL_HOST_USER,
        [
            to_email,
        ],
        html_message=email_body,
    )


def send_email_verification_email(user, request):
    token = account_activation_token.make_token(user)

    token_cipher = AESCipher().encrypt(f"{token}:{user.identifier}").decode("utf-8")
    token_cipher = token_cipher.replace("/", "_")
    relativeUrl = settings.FRONTEND_EMAIL_VERIFICATION_PATH.format(token=token_cipher)

    absoluteUrl = f"{'https' if settings.TLS_ENABLED else 'http'}://{settings.FRONTEND_DOMAIN}{relativeUrl}"
    from adey_apps.users.tasks import send_activation_email as send_mail
    send_mail.delay(user.email, absoluteUrl)


def send_password_reset_email(user, request):
    token_generator = PasswordResetTokenGenerator()
    token = token_generator.make_token(user)

    token_cipher = AESCipher().encrypt(f"{token}:{user.identifier}").decode("utf-8")
    token_cipher = token_cipher.replace("/", "_")
    relativeUrl = settings.FRONTEND_PASSWORD_RESET_PATH.format(token=token_cipher)

    absoluteUrl = f"{'https' if settings.TLS_ENABLED else 'http'}://{settings.FRONTEND_DOMAIN}{relativeUrl}"
    from adey_apps.users.tasks import send_password_reset_email as send_mail
    send_mail.delay(user.email, absoluteUrl)
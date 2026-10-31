"""Browser check for /auth/login against a running dev server.

    uv run --python 3.11 --with playwright python frontend/e2e/login_check.py [base_url] [screenshot_dir]

Needs `playwright install chromium` once. Backend replies are mocked at
NextAuth's callback, so the backend can be up or down.
"""

import json
import sys
import urllib.parse

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
CALLBACK = "**/api/auth/callback/credentials*"
# Next's route announcer also has role=alert, so scope to the form
ALERT = "form [role=alert]"


def backend_says(payload):
    error = payload if isinstance(payload, str) else json.dumps(payload)
    url = f"{BASE}/api/auth/error?error=" + urllib.parse.quote(error)
    return lambda route: route.fulfill(
        status=401, content_type="application/json", body=json.dumps({"url": url})
    )


def submit(page):
    page.fill("#email", "tana@example.com")
    page.fill("#password", "wrong-password")
    page.click("button[type=submit]")
    page.wait_for_selector(ALERT, timeout=20000)
    return page.inner_text(ALERT)


def shot(page, name):
    if SHOTS:
        page.screenshot(path=f"{SHOTS}/{name}.png", full_page=True)


NETWORK = "Can't reach Adey right now. Try again in a moment."
CASES = [
    # NextAuth's plain-string error when it can't reach the backend
    ("CredentialsSignin", NETWORK),
    (
        {"message": "No active account found with the given credentials", "code": "no_active_account"},
        "That email and password don't match an account. Check them and try again.",
    ),
    (
        {"message": "This account email is not verified.", "code": "unverified_account"},
        "Verify your email before signing in.\n\nResend verification email",
    ),
    (
        {"email": [{"message": "Enter a valid email address.", "code": "invalid"}]},
        "Enter a valid email address.",
    ),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, width in [("login-desktop", 1440), ("login-mobile", 375)]:
        page = browser.new_page(viewport={"width": width, "height": 900})
        page.goto(f"{BASE}/auth/login", wait_until="networkidle", timeout=180000)
        shot(page, name)
        page.close()

    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.route(CALLBACK, lambda route: route.abort())
    page.goto(f"{BASE}/auth/login", wait_until="networkidle")
    got = submit(page)
    assert got == NETWORK, got
    shot(page, "err-request-failed")

    for i, (payload, expected) in enumerate(CASES):
        page.unroute(CALLBACK)
        page.route(CALLBACK, backend_says(payload))
        page.goto(f"{BASE}/auth/login", wait_until="networkidle")
        got = submit(page)
        assert got.strip() == expected, got
        assert page.locator(f"{ALERT} li").count() == 0, "errors render as sentences, not bullets"
        shot(page, f"err-{i}")
    page.unroute(CALLBACK)

    page.goto(f"{BASE}/auth/login", wait_until="networkidle")
    requests = []
    page.on("request", lambda r: requests.append(r.url))
    page.click("text=Continue with Google")
    page.wait_for_timeout(2500)
    assert any("/api/auth/signin/google" in u for u in requests), requests
    assert not any("/callback/credentials" in u for u in requests), "Google must not submit the password form"

    browser.close()
    print("login check passed")

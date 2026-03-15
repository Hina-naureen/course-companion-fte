"""
Comprehensive auth + endpoint test suite for the Course Tutor API.
Run: python tutor/test_auth.py   (from backend/)
Server must be running on port 8002.
"""
import sys
import time
import json
import urllib.request
import urllib.error

BASE = "http://127.0.0.1:8003"
_TS = str(int(time.time()))[-6:]   # unique suffix per run
PASS = 0
FAIL = 0


def req(method, path, body=None, token=None, expected=None):
    global PASS, FAIL
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        r = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(r) as resp:
            status = resp.status
            try:
                payload = json.loads(resp.read())
            except Exception:
                payload = {}
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            payload = json.loads(e.read())
        except Exception:
            payload = {}

    label = f"{method} {path}"
    if expected is not None and status != expected:
        print(f"  FAIL  {label}  expected={expected} got={status}  {payload}")
        FAIL += 1
    else:
        print(f"  OK    {label}  status={status}")
        PASS += 1

    return status, payload


def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print("="*60)


# ── 1. Register ────────────────────────────────────────────────
section("POST /auth/register")

_, reg = req("POST", "/auth/register",
             {"email": f"alice{_TS}@example.com", "password": "S3curePass!"},
             expected=201)
alice_access  = reg.get("access_token", "")
alice_refresh = reg.get("refresh_token", "")
alice_id      = reg.get("user", {}).get("user_id", "")
print(f"    alice_id = {alice_id}")

# duplicate
req("POST", "/auth/register",
    {"email": f"alice{_TS}@example.com", "password": "S3curePass!"},
    expected=409)

# weak password
req("POST", "/auth/register",
    {"email": f"bob{_TS}@example.com", "password": "short"},
    expected=422)

# register bob for cross-user test
_, breg = req("POST", "/auth/register",
              {"email": f"bob{_TS}@example.com", "password": "B0bSecure#"},
              expected=201)
bob_access = breg.get("access_token", "")
bob_id     = breg.get("user", {}).get("user_id", "")
print(f"    bob_id   = {bob_id}")

# ── 2. Login ───────────────────────────────────────────────────
section("POST /auth/login")

_, log_ok = req("POST", "/auth/login",
                {"email": f"alice{_TS}@example.com", "password": "S3curePass!"},
                expected=200)
alice_access  = log_ok.get("access_token", alice_access)
alice_refresh = log_ok.get("refresh_token", alice_refresh)

req("POST", "/auth/login",
    {"email": f"alice{_TS}@example.com", "password": "WrongPass!"},
    expected=401)

req("POST", "/auth/login",
    {"email": "nobody@example.com", "password": "S3curePass!"},
    expected=401)

# ── 3. GET /auth/me ────────────────────────────────────────────
section("GET /auth/me")
req("GET", "/auth/me", token=alice_access, expected=200)
req("GET", "/auth/me", token="garbage.token.here", expected=401)
req("GET", "/auth/me", expected=403)

# ── 4. Refresh rotation ────────────────────────────────────────
section("POST /auth/refresh")
_, ref1 = req("POST", "/auth/refresh",
              {"refresh_token": alice_refresh},
              expected=200)
alice_access2  = ref1.get("access_token", "")
alice_refresh2 = ref1.get("refresh_token", "")

# reuse the OLD refresh token — must be rejected
req("POST", "/auth/refresh",
    {"refresh_token": alice_refresh},
    expected=401)

# ── 5. Logout ──────────────────────────────────────────────────
section("POST /auth/logout + revocation")
req("POST", "/auth/logout", {"refresh_token": alice_refresh2}, expected=204)

# refresh after logout must fail
req("POST", "/auth/refresh", {"refresh_token": alice_refresh2}, expected=401)

# get a fresh pair for the remaining tests
_, fresh = req("POST", "/auth/login",
               {"email": f"alice{_TS}@example.com", "password": "S3curePass!"},
               expected=200)
alice_token = fresh.get("access_token", "")

# ── 6. Protected endpoints — no token ─────────────────────────
section("Protected endpoints without token -- 403")
for path in ["/chapters", "/chapters/1", "/chapters/1/next",
             "/search?q=ai", "/access/check?chapter_id=1"]:
    req("GET", path, expected=403)

# ── 7. GET /chapters ───────────────────────────────────────────
section("GET /chapters")
_, chs = req("GET", "/chapters", token=alice_token, expected=200)
if chs:
    print(f"    chapters returned: {len(chs)}")
    first_slug = chs[0]["id"]
else:
    first_slug = "what-is-generative-ai"
    print("    WARNING: no chapters returned")

# ── 8. GET /chapters/{id} ──────────────────────────────────────
section("GET /chapters/{id}")
req("GET", f"/chapters/{first_slug}", token=alice_token, expected=200)
req("GET", "/chapters/1",            token=alice_token, expected=200)
req("GET", "/chapters/999",          token=alice_token, expected=404)

# ── 9. GET /chapters/{id}/next ────────────────────────────────
section("GET /chapters/{id}/next")
req("GET", "/chapters/1/next", token=alice_token, expected=200)

# ── 10. POST /quiz/{id}/submit ────────────────────────────────
section("POST /quiz/{id}/submit")
req("POST", f"/quiz/{first_slug}/submit",
    {"answers": {"q1": "a", "q2": "b", "q3": "c", "q4": "d", "q5": "a"}},
    token=alice_token, expected=200)

# empty answers
req("POST", f"/quiz/{first_slug}/submit",
    {"answers": {}},
    token=alice_token, expected=422)

# bad chapter
req("POST", "/quiz/no-such-chapter/submit",
    {"answers": {"q1": "a"}},
    token=alice_token, expected=404)

# ── 11. PUT /progress/{user_id} ───────────────────────────────
section("PUT /progress/{user_id}")
req("PUT", f"/progress/{alice_id}",
    {"chapter_id": first_slug, "status": "in_progress"},
    token=alice_token, expected=200)

# alice cannot update bob's progress
req("PUT", f"/progress/{bob_id}",
    {"chapter_id": first_slug, "status": "in_progress"},
    token=alice_token, expected=403)

# bob can update his own
req("PUT", f"/progress/{bob_id}",
    {"chapter_id": first_slug, "status": "completed"},
    token=bob_access, expected=200)

# ── 12. GET /search ───────────────────────────────────────────
section("GET /search")
req("GET", "/search?q=neural+network", token=alice_token, expected=200)
req("GET", "/search?q=x&limit=3",     token=alice_token, expected=200)
req("GET", "/search",                  token=alice_token, expected=422)  # missing q

# ── 13. GET /access/check ─────────────────────────────────────
section("GET /access/check")
req("GET", f"/access/check?chapter_id={first_slug}", token=alice_token, expected=200)
req("GET", "/access/check?chapter_id=no-such",       token=alice_token, expected=404)
req("GET", "/access/check",                           token=alice_token, expected=422)  # missing param

# ── Summary ───────────────────────────────────────────────────
total = PASS + FAIL
print(f"\n{'='*60}")
print(f"  Results: {PASS}/{total} passed, {FAIL} failed")
print("="*60)
sys.exit(0 if FAIL == 0 else 1)

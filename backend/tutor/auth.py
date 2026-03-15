"""
JWT authentication for the Course Tutor API.

Token strategy
--------------
Access token  — short-lived (60 min), HS256 JWT carrying user_id + tier.
Refresh token — long-lived (7 days), HS256 JWT.  The SHA-256 hash of the raw
                JWT is stored in the `refresh_tokens` table, enabling single-use
                rotation and server-side revocation.

On every refresh the old DB row is deleted and a new token is issued, so a
stolen refresh token can only be used once before it becomes invalid.

Environment variables
---------------------
JWT_SECRET   — signing key (must be set in production; defaults to a dev value)
JWT_ALG      — algorithm (default HS256)
"""
from __future__ import annotations

import hashlib
import os
import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import RefreshToken, User
from .schemas import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserProfile,
)

# ── Configuration ──────────────────────────────────────────────────────────────

SECRET_KEY  = os.environ.get("JWT_SECRET", "dev-secret-CHANGE-in-production")
ALGORITHM   = os.environ.get("JWT_ALG", "HS256")
ACCESS_TTL  = timedelta(minutes=int(os.environ.get("JWT_ACCESS_MINUTES", "60")))
REFRESH_TTL = timedelta(days=int(os.environ.get("JWT_REFRESH_DAYS", "7")))

_bearer = HTTPBearer(auto_error=True)

# ── Password helpers ───────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(12)).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


# ── Token creation ─────────────────────────────────────────────────────────────

def _make_access_token(user_id: str, tier: str) -> str:
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "sub":  user_id,
            "tier": tier,
            "type": "access",
            "iat":  now,
            "exp":  now + ACCESS_TTL,
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def _make_refresh_token(user_id: str) -> tuple[str, str, datetime]:
    """
    Returns (raw_jwt, sha256_hex, expires_at).
    Only the hash is persisted — the raw JWT is returned to the client once.
    """
    now     = datetime.now(UTC)
    expires = now + REFRESH_TTL
    raw = jwt.encode(
        {
            "sub":  user_id,
            "type": "refresh",
            "jti":  secrets.token_hex(16),  # unique nonce prevents hash collisions
            "iat":  now,
            "exp":  expires,
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, token_hash, expires


def issue_tokens(user_id: str, tier: str, db: Session) -> dict:
    """
    Mint an access + refresh token pair, persist the refresh hash, return
    a dict suitable for TokenResponse.
    """
    access_token = _make_access_token(user_id, tier)
    raw_refresh, token_hash, expires_at = _make_refresh_token(user_id)

    db.add(RefreshToken(
        token_hash = token_hash,
        user_id    = user_id,
        expires_at = expires_at,
    ))
    db.commit()

    return {
        "access_token":  access_token,
        "refresh_token": raw_refresh,
        "token_type":    "bearer",
        "expires_in":    int(ACCESS_TTL.total_seconds()),
    }


# ── Token decoding ─────────────────────────────────────────────────────────────

def _decode_token(raw: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(raw, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Expected a {expected_type} token.",
        )
    return payload


# ── FastAPI dependency ─────────────────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the Bearer token to a User row.
    Inject with:  current_user: Annotated[User, Depends(get_current_user)]
    """
    payload = _decode_token(credentials.credentials, "access")
    user    = db.get(User, payload["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User belonging to this token no longer exists.",
        )
    return user


# ── Auth router ────────────────────────────────────────────────────────────────

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Creates a new free-tier account.
    Returns an access + refresh token pair on success.
    """
    existing = db.query(User).filter_by(email=body.email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        user_id       = secrets.token_urlsafe(12),
        email         = body.email,
        password_hash = hash_password(body.password),
        tier          = "free",
    )
    db.add(user)
    db.flush()   # populate user.user_id before issue_tokens

    tokens = issue_tokens(user.user_id, user.tier, db)
    return TokenResponse(user=UserProfile.model_validate(user), **tokens)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive tokens",
)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates with email + password.
    Returns a fresh access + refresh token pair.
    """
    user = db.query(User).filter_by(email=body.email).first()

    # Constant-time check: always call verify_password even if user is None
    # to prevent user-enumeration via timing differences.
    dummy_hash = "$2b$12$invalidhashpadding000000000000000000000000000000000000000"
    stored     = user.password_hash if (user and user.password_hash) else dummy_hash

    if not verify_password(body.password, stored) or user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    tokens = issue_tokens(user.user_id, user.tier, db)
    return TokenResponse(user=UserProfile.model_validate(user), **tokens)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for a new token pair",
)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    """
    Validates the refresh token, deletes the old DB row (single-use rotation),
    and returns a new access + refresh token pair.

    A reused or revoked refresh token returns 401.
    """
    payload    = _decode_token(body.refresh_token, "refresh")
    token_hash = hashlib.sha256(body.refresh_token.encode()).hexdigest()

    stored = db.query(RefreshToken).filter_by(token_hash=token_hash).first()
    if stored is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not recognised or already used.",
        )

    user = db.get(User, payload["sub"])
    if user is None:
        db.delete(stored)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )

    # Rotate: delete old token, issue new pair
    db.delete(stored)
    db.flush()
    tokens = issue_tokens(user.user_id, user.tier, db)
    return TokenResponse(user=UserProfile.model_validate(user), **tokens)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke the current refresh token",
)
def logout(
    body: RefreshRequest,
    db: Session = Depends(get_db),
):
    """
    Deletes the refresh token from the DB, invalidating it server-side.
    The access token remains valid until it naturally expires (max 60 min).
    Send the refresh token in the request body.
    """
    token_hash = hashlib.sha256(body.refresh_token.encode()).hexdigest()
    stored     = db.query(RefreshToken).filter_by(token_hash=token_hash).first()
    if stored:
        db.delete(stored)
        db.commit()
    # Always 204 — don't leak whether the token existed


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Return the current user's profile",
)
def me(current_user: User = Depends(get_current_user)):
    """Requires a valid access token."""
    return UserProfile.model_validate(current_user)

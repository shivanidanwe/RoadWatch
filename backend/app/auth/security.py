import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.app.config import config

security = HTTPBearer(auto_error=False)

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a unique salt.
    """
    if not salt:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    ).hex()
    return pw_hash, salt

def verify_password(password: str, hashed: str, salt: str) -> bool:
    """
    Verifies a plain password against the stored PBKDF2 hash and salt.
    """
    computed_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(computed_hash, hashed)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=config.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a signed JWT token.
    """
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """
    FastAPI dependency to verify bearer token and ensure the user is an authorized
    Municipal Authority Admin.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials. Please log in as Municipal Authority Admin.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin_email = payload.get("sub")
    if not admin_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from backend.app.database import db
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM admin_users WHERE email = ?", (admin_email,))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Municipal Authority Admin account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = dict(row)
    if user.get("role") != "Municipal Authority Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted strictly to Municipal Authority Admin role.",
        )

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "created_at": user.get("created_at"),
        "last_login": user.get("last_login")
    }

import logging
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field

from backend.app.database import db
from backend.app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_admin
)

logger = logging.getLogger("roadwatch.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, description="Municipal Authority Admin email")
    password: str = Field(..., min_length=1, description="Admin password")

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class AdminSetupRequest(BaseModel):
    email: str = Field(..., min_length=3, description="Initial admin email")
    password: str = Field(..., min_length=8, description="Strong password (at least 8 chars)")
    name: str = Field(default="Municipal Authority Admin", description="Full name of admin officer")

@router.post("/login", response_model=LoginResponse)
def admin_login(req: LoginRequest):
    """
    Authenticates the Municipal Authority Admin.
    Strictly restricted to authorized Municipal Authority Admin role.
    """
    clean_email = req.email.strip().lower()

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM admin_users WHERE LOWER(email) = ?", (clean_email,))
        row = cursor.fetchone()

        if not row:
            logger.warning(f"Failed login attempt: email '{clean_email}' not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid administrator credentials or unauthorized user."
            )

        user = dict(row)
        if not verify_password(req.password, user["password_hash"], user["salt"]):
            logger.warning(f"Failed login attempt: incorrect password for '{clean_email}'")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid administrator credentials or unauthorized user."
            )

        if user.get("role") != "Municipal Authority Admin":
            logger.warning(f"Blocked login attempt: '{clean_email}' role is '{user.get('role')}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted strictly to Municipal Authority Admin role."
            )

        now_str = datetime.now().isoformat()
        cursor.execute("UPDATE admin_users SET last_login = ? WHERE id = ?", (now_str, user["id"]))

        # Write to audit_logs
        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            f"LOG-AUTH-{uuid.uuid4().hex[:12]}",
            now_str,
            user["email"],
            "ADMIN_LOGIN",
            f"Municipal Authority Admin logged in from IP"
        ))
        conn.commit()

    # Generate JWT
    token_data = {
        "sub": user["email"],
        "name": user["name"],
        "role": user["role"],
        "uid": user["id"]
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "last_login": now_str
        }
    }

@router.get("/me")
def get_current_user_profile(admin: Dict[str, Any] = Depends(get_current_admin)):
    """
    Returns authenticated Municipal Authority Admin user details.
    """
    return {
        "user": admin,
        "authenticated": True,
        "role": admin["role"]
    }

@router.post("/logout")
def admin_logout(admin: Optional[Dict[str, Any]] = Depends(get_current_admin)):
    """
    Terminates admin session and writes audit log.
    """
    if admin:
        now_str = datetime.now().isoformat()
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO audit_logs (id, timestamp, user, action, details)
            VALUES (?, ?, ?, ?, ?)
            """, (
                f"LOG-AUTH-{uuid.uuid4().hex[:12]}",
                now_str,
                admin["email"],
                "ADMIN_LOGOUT",
                "Municipal Authority Admin logged out"
            ))
            conn.commit()
    return {"message": "Logged out successfully"}

@router.post("/setup")
def setup_initial_admin(req: AdminSetupRequest):
    """
    Allows setting up the primary Municipal Authority Admin if no admin accounts exist.
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM admin_users")
        cnt = cursor.fetchone()["cnt"]

        if cnt > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin account is already configured. Please log in with established credentials."
            )

        pw_hash, salt = hash_password(req.password)
        now_str = datetime.now().isoformat()
        user_id = "USR-ADMIN-01"

        cursor.execute("""
        INSERT INTO admin_users (
            id, email, password_hash, salt, name, role, created_at, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, req.email.strip().lower(), pw_hash, salt,
            req.name, "Municipal Authority Admin", now_str, now_str
        ))
        conn.commit()

    return {"message": "Municipal Authority Admin initialized successfully. You may now sign in."}

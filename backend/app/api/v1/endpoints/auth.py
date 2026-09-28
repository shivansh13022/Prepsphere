from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserLogin
from app.schemas.auth import GoogleAuthRequest, TokenResponse


router = APIRouter()


@router.post(
    "/auth/login",
    response_model=TokenResponse,
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.email == login_data.email)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.password_hash or not verify_password(
        login_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post(
    "/auth/google",
    response_model=TokenResponse,
)
def google_login(
    auth_data: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    # Verify the Google ID token.
    try:
        google_user = id_token.verify_oauth2_token(
            auth_data.credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential",
        )

    google_sub = google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name")
    email_verified = google_user.get("email_verified", False)

    if not google_sub or not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account could not be verified",
        )

    # First look for an already-linked Google account.
    user = db.scalar(
        select(User).where(User.google_sub == google_sub)
    )

    if not user:
        # The user may already have registered with email/password.
        user = db.scalar(
            select(User).where(User.email == email)
        )

        if user:
            # Link Google to the existing PrepSphere account.
            user.google_sub = google_sub
            user.is_verified = True

        else:
            # First Google login: create the PrepSphere account.
            user = User(
                name=name or email.split("@")[0],
                email=email,
                password_hash=None,
                google_sub=google_sub,
                is_active=True,
                is_verified=True,
            )

            db.add(user)

        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
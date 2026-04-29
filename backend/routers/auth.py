from fastapi import APIRouter, Depends, HTTPException

from backend.dependencies import get_conn_public, release_conn
from backend.schemas import LoginRequest, TokenResponse
from backend.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, conn=Depends(get_conn_public)):
    try:
        row = await conn.fetchrow(
            "SELECT user_id, email, password_hash, role, is_active "
            "FROM users WHERE email=$1",
            payload.email,
        )
        if not row or not row["is_active"]:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_password(payload.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(user_id=str(row["user_id"]), role=row["role"])
        return TokenResponse(
            access_token=token,
            role=row["role"],
            user_id=str(row["user_id"]),
        )
    finally:
        await release_conn(conn)

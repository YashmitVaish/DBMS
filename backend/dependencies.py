from typing import Callable, Iterable

import asyncpg
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import backend.db as db
from backend.security import decode_token

bearer_scheme = HTTPBearer(auto_error=False)


async def _get_conn() -> asyncpg.Connection:
    if db.pool is None:
        raise RuntimeError("DB pool not initialized")
    return await db.pool.acquire()


async def get_current_user(
    request: Request,
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = decode_token(creds.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    role = payload.get("role")
    if not user_id or not role:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = await _get_conn()
    try:
        row = await conn.fetchrow(
            "SELECT user_id, name, email, role, department_id, is_active "
            "FROM users WHERE user_id=$1::uuid",
            user_id,
        )
        if not row or not row["is_active"]:
            raise HTTPException(status_code=401, detail="User inactive or not found")

        user = dict(row)
        user["user_id"] = str(user["user_id"])
        request.state.user = user
        return user
    finally:
        await db.pool.release(conn)


def require_roles(roles: Iterable[str]) -> Callable:
    async def _dep(current_user=Depends(get_current_user)):
        if current_user["role"] not in set(roles):
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user

    return _dep


async def get_conn_public(request: Request) -> asyncpg.Connection:
    conn = await _get_conn()
    try:
        # Clear session vars for pooled connection
        await conn.execute("RESET app.current_user_id")
        await conn.execute("RESET app.current_user_role")
        return conn
    except Exception:
        await db.pool.release(conn)
        raise


async def get_conn_authed(
    request: Request,
    current_user=Depends(get_current_user),
) -> asyncpg.Connection:
    conn = await _get_conn()
    try:
        # Set session vars for RLS policies
        await conn.fetchval("SELECT set_config('app.current_user_id', $1, false)", str(current_user["user_id"]))
        await conn.fetchval("SELECT set_config('app.current_user_role', $1, false)", str(current_user["role"]))
        return conn
    except Exception:
        await db.pool.release(conn)
        raise


async def release_conn(conn: asyncpg.Connection) -> None:
    if db.pool is not None:
        await db.pool.release(conn)

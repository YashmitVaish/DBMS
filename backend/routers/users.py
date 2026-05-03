from fastapi import APIRouter, Depends

from dependencies import get_conn_authed, release_conn, require_roles
from schemas import UserCreate, UserOut
from security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def me(current_user=Depends(require_roles(["student", "teacher", "admin", "dept_head"]))):
    return current_user


@router.get("/", response_model=list[UserOut])
async def list_users(
    conn=Depends(get_conn_authed),
    _admin=Depends(require_roles(["admin"]))
):
    try:
        rows = await conn.fetch(
            "SELECT user_id, name, email, role, department_id, is_active "
            "FROM users ORDER BY created_at DESC LIMIT 200"
        )
        out = []
        for r in rows:
            d = dict(r)
            d["user_id"] = str(d["user_id"])
            out.append(d)
        return out
    finally:
        await release_conn(conn)


@router.post("/", response_model=UserOut)
async def create_user(
    payload: UserCreate,
    conn=Depends(get_conn_authed),
    _admin=Depends(require_roles(["admin"]))
):
    try:
        row = await conn.fetchrow(
            "INSERT INTO users (name, email, password_hash, role, department_id) "
            "VALUES ($1,$2,$3,$4,$5) "
            "RETURNING user_id, name, email, role, department_id, is_active",
            payload.name,
            payload.email,
            hash_password(payload.password),
            payload.role,
            payload.department_id,
        )
        d = dict(row)
        d["user_id"] = str(d["user_id"])
        return d
    finally:
        await release_conn(conn)

from fastapi import APIRouter, Depends

from backend.dependencies import get_conn_authed, release_conn, require_roles
from backend.schemas import CourseCreate, CourseOut

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/", response_model=list[CourseOut])
async def list_courses(conn=Depends(get_conn_authed), _u=Depends(require_roles(["student", "teacher", "admin", "dept_head"]))):
    try:
        rows = await conn.fetch(
            "SELECT course_id, code, name, department_id, credits, max_students, is_active "
            "FROM courses WHERE is_active=TRUE ORDER BY code"
        )
        return [dict(r) for r in rows]
    finally:
        await release_conn(conn)


@router.post("/", response_model=CourseOut)
async def create_course(
    payload: CourseCreate,
    conn=Depends(get_conn_authed),
    _admin=Depends(require_roles(["admin"]))
):
    try:
        row = await conn.fetchrow(
            "INSERT INTO courses (code, name, department_id, credits, max_students) "
            "VALUES ($1,$2,$3,$4,$5) "
            "RETURNING course_id, code, name, department_id, credits, max_students, is_active",
            payload.code,
            payload.name,
            payload.department_id,
            payload.credits,
            payload.max_students,
        )
        return dict(row)
    finally:
        await release_conn(conn)

from fastapi import APIRouter, Depends

from backend.dependencies import get_conn_authed, release_conn, require_roles
from backend.schemas import EnrollmentRequest, TeacherAssignRequest

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/enroll")
async def enroll_student(
    payload: EnrollmentRequest,
    conn=Depends(get_conn_authed),
    _admin=Depends(require_roles(["admin"]))
):
    try:
        row = await conn.fetchrow(
            "INSERT INTO course_enrollments (student_id, course_id, is_active) "
            "VALUES ($1::uuid, $2, $3) "
            "ON CONFLICT (student_id, course_id) DO UPDATE SET is_active = EXCLUDED.is_active "
            "RETURNING student_id, course_id, is_active",
            payload.student_id,
            payload.course_id,
            payload.is_active,
        )
        d = dict(row)
        d["student_id"] = str(d["student_id"])
        return d
    finally:
        await release_conn(conn)


@router.post("/assign-teacher")
async def assign_teacher(
    payload: TeacherAssignRequest,
    conn=Depends(get_conn_authed),
    _admin=Depends(require_roles(["admin"]))
):
    try:
        row = await conn.fetchrow(
            "INSERT INTO course_teachers (teacher_id, course_id, period_id) "
            "VALUES ($1::uuid, $2, $3) "
            "ON CONFLICT (teacher_id, course_id, period_id) DO NOTHING "
            "RETURNING teacher_id, course_id, period_id",
            payload.teacher_id,
            payload.course_id,
            payload.period_id,
        )
        if row is None:
            return {"ok": True, "created": False}
        d = dict(row)
        d["teacher_id"] = str(d["teacher_id"])
        return {"ok": True, "created": True, **d}
    finally:
        await release_conn(conn)

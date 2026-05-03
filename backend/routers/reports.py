from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, Query

from dependencies import get_conn_authed, release_conn, require_roles

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/student/me")
async def my_report(
    period_id: int = Query(..., ge=1),
    conn=Depends(get_conn_authed),
    current_user=Depends(require_roles(["student"]))
):
    try:
        student_id = str(current_user["user_id"])
        rows = await conn.fetch(
            "SELECT * FROM generate_attendance_report($1::uuid, $2)",
            student_id,
            period_id,
        )
        return {"student_id": student_id, "period_id": period_id, "rows": [dict(r) for r in rows]}
    finally:
        await release_conn(conn)


@router.get("/student/{student_id}")
async def student_report(
    student_id: str,
    period_id: int = Query(..., ge=1),
    conn=Depends(get_conn_authed),
    current_user=Depends(require_roles(["teacher", "admin", "dept_head"]))
):
    try:
        rows = await conn.fetch(
            "SELECT * FROM generate_attendance_report($1::uuid, $2)",
            student_id,
            period_id,
        )
        return {"student_id": student_id, "period_id": period_id, "rows": [dict(r) for r in rows]}
    finally:
        await release_conn(conn)


@router.get("/low-attendance")
async def low_attendance(
    course_id: int = Query(..., ge=1),
    period_id: int = Query(..., ge=1),
    conn=Depends(get_conn_authed),
    _u=Depends(require_roles(["teacher", "admin", "dept_head"]))
):
    try:
        rows = await conn.fetch(
            "SELECT * FROM check_attendance_below_threshold($1, $2)",
            course_id,
            period_id,
        )
        return [dict(r) for r in rows]
    finally:
        await release_conn(conn)


@router.get("/daily")
async def daily_report(
    date: date_type | None = None,
    conn=Depends(get_conn_authed),
    _u=Depends(require_roles(["teacher", "admin"]))
):
    try:
        if date is None:
            rows = await conn.fetch(
                "SELECT * FROM daily_attendance_report WHERE date = CURRENT_DATE ORDER BY course_code, student_name"
            )
        else:
            rows = await conn.fetch(
                "SELECT * FROM daily_attendance_report WHERE date = $1 ORDER BY course_code, student_name",
                date,
            )
        return [dict(r) for r in rows]
    finally:
        await release_conn(conn)

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_conn_authed, release_conn, require_roles
from schemas import AttendanceBulkRequest, AttendanceMarkRequest, AttendanceUpdateRequest

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/mark")
async def mark_attendance(
    payload: AttendanceMarkRequest,
    conn=Depends(get_conn_authed),
    current_user=Depends(require_roles(["teacher", "admin"]))
):
    try:
        row = await conn.fetchrow(
            "INSERT INTO attendance (student_id, course_id, period_id, date, status, marked_by, remarks) "
            "VALUES ($1::uuid,$2,$3,$4,$5,$6::uuid,$7) "
            "ON CONFLICT (student_id, course_id, date) DO UPDATE SET "
            "  status=EXCLUDED.status, period_id=EXCLUDED.period_id, marked_by=EXCLUDED.marked_by, "
            "  remarks=EXCLUDED.remarks, updated_at=NOW() "
            "RETURNING attendance_id",
            payload.student_id,
            payload.course_id,
            payload.period_id,
            payload.date,
            payload.status,
            str(current_user["user_id"]),
            payload.remarks,
        )
        return {"attendance_id": row["attendance_id"]}
    finally:
        await release_conn(conn)


@router.post("/bulk")
async def bulk_mark_attendance(
    payload: AttendanceBulkRequest,
    conn=Depends(get_conn_authed),
    current_user=Depends(require_roles(["teacher", "admin"]))
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="items is empty")

    student_ids = [i.student_id for i in payload.items]
    statuses = [i.status for i in payload.items]

    try:
        await conn.execute(
            "CALL bulk_mark_attendance($1,$2,$3,$4::uuid[],$5::attendance_status[],$6::uuid,$7)",
            payload.course_id,
            payload.period_id,
            payload.date,
            student_ids,
            statuses,
            str(current_user["user_id"]),
            payload.remarks,
        )
        return {"ok": True, "count": len(payload.items)}
    finally:
        await release_conn(conn)


@router.put("/{attendance_id}")
async def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdateRequest,
    conn=Depends(get_conn_authed),
    current_user=Depends(require_roles(["teacher", "admin"]))
):
    try:
        await conn.execute(
            "CALL update_attendance_with_audit($1,$2::attendance_status,$3::uuid,$4)",
            attendance_id,
            payload.new_status,
            str(current_user["user_id"]),
            payload.reason,
        )
        return {"ok": True}
    finally:
        await release_conn(conn)

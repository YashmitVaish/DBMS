from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

UserRole = Literal['student', 'teacher', 'admin', 'dept_head']
AttendanceStatus = Literal['present', 'absent', 'late', 'excused']


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    role: UserRole
    user_id: str


class UserOut(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    role: UserRole
    department_id: Optional[int] = None
    is_active: bool


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: UserRole
    department_id: Optional[int] = None


class CourseOut(BaseModel):
    course_id: int
    code: str
    name: str
    department_id: int
    credits: int
    max_students: int
    is_active: bool


class CourseCreate(BaseModel):
    code: str
    name: str
    department_id: int
    credits: int = Field(ge=1, le=10)
    max_students: int = Field(default=60, ge=1)


class AttendanceMarkRequest(BaseModel):
    student_id: str
    course_id: int
    period_id: int
    date: date
    status: AttendanceStatus
    remarks: Optional[str] = None


class BulkAttendanceItem(BaseModel):
    student_id: str
    status: AttendanceStatus


class AttendanceBulkRequest(BaseModel):
    course_id: int
    period_id: int
    date: date
    items: list[BulkAttendanceItem]
    remarks: Optional[str] = None


class AttendanceUpdateRequest(BaseModel):
    new_status: AttendanceStatus
    reason: Optional[str] = None


class EnrollmentRequest(BaseModel):
    student_id: str
    course_id: int
    is_active: bool = True


class TeacherAssignRequest(BaseModel):
    teacher_id: str
    course_id: int
    period_id: int

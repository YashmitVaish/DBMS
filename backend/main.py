from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db import init_pool, close_pool
from routers import auth, users, courses, attendance, reports, admin


app = FastAPI(title="Attendance Management System API")

allow_origins = settings.cors_allow_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
async def _startup() -> None:
    await init_pool()

@app.on_event("shutdown")
async def _shutdown() -> None:
    await close_pool()

@app.get("/health")
async def health():
    return {"ok": True}

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(attendance.router)
app.include_router(reports.router)
app.include_router(admin.router)

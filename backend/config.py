import os


class Settings:
    def __init__(self) -> None:
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql://app_user:yourpassword@localhost:5432/attendance_db",
        )
        self.jwt_secret = os.getenv(
            "JWT_SECRET",
            "dev-secret-change-me-dev-secret-change-me",
        )
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

        cors_raw = os.getenv("CORS_ALLOW_ORIGINS", "*")
        self.cors_allow_origins = ["*"] if cors_raw.strip() == "*" else [o.strip() for o in cors_raw.split(",") if o.strip()]


settings = Settings()

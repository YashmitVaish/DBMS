import asyncpg

from config import settings

pool: asyncpg.Pool | None = None


async def init_pool() -> None:
    global pool
    if pool is not None:
        return
    pool = await asyncpg.create_pool(settings.database_url, min_size=1, max_size=10)


async def close_pool() -> None:
    global pool
    if pool is None:
        return
    await pool.close()
    pool = None

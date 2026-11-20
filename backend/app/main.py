from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import auth, users, profiles, companies, rounds, interviews, questions
from app.database import get_db

app = FastAPI(title="Interview Hub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(companies.router)
app.include_router(rounds.router)
app.include_router(interviews.router)
app.include_router(questions.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/health/db")
async def health_db(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    result.scalar()
    return {"status": "ok", "database": "connected"}

_mangum_handler = Mangum(app, api_gateway_base_path="/dev")


def handler(event, context):
    if event.get("action") == "migrate":
        import asyncio
        import os
        from alembic.config import Config
        from alembic import command

        os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        # Restore event loop for subsequent HTTP invocations in this container
        asyncio.set_event_loop(asyncio.new_event_loop())
        return {"status": "migrations complete"}

    return _mangum_handler(event, context)
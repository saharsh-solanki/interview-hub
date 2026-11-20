from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import auth, users, profiles, companies, rounds, interviews, questions
from app.config import settings
from app.database import get_db

app = FastAPI(title="Interview Hub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://interview-hub-frontend-dev-frontendbucket-hejiz7fwnzko.s3-website-ap-southeast-2.amazonaws.com",
    ],
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


def _reset_async_state():
    import asyncio
    from app import database
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    database.engine = database.create_async_engine(settings.get_database_url(), echo=False)
    database.async_session = database.async_sessionmaker(
        database.engine, class_=database.AsyncSession, expire_on_commit=False
    )


def handler(event, context):
    action = event.get("action")

    if action == "migrate":
        import os
        from alembic.config import Config
        from alembic import command

        os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        _reset_async_state()
        return {"status": "migrations complete"}

    if action == "seed":
        import asyncio
        from app.seed import seed

        asyncio.run(seed())
        _reset_async_state()
        return {"status": "seed complete"}

    return _mangum_handler(event, context)
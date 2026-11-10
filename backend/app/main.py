from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.api import auth, users, profiles, companies, rounds, interviews, questions

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

handler = Mangum(app)
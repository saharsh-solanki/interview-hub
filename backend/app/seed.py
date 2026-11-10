import asyncio
from passlib.context import CryptContext
from sqlalchemy import select

from app.database import engine, async_session, Base
from app.models.models import User, Profile, Company, Round

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SEED_USERS = [
    {"name": "Admin", "password": "admin@123", "role": "admin"},
    {"name": "Sales", "password": "sales@123", "role": "sales"},
    {"name": "Saharsh", "password": "saharsh@123", "role": "interviewer"},
    {"name": "Bhupen", "password": "bhupen@123", "role": "interviewer"},
]

SEED_PROFILES = [
    {
        "name": "Bhupen Patel",
        "email": "bhupen@example.com",
        "phone": "9876543210",
        "father_name": "Rajesh Patel",
        "mother_name": "Meena Patel",
        "dob": "1995-06-15",
        "education": "B.Tech Computer Science",
        "passout_year": "2017",
        "experience": "5 years",
        "skills": "React, Node.js, Python",
        "aadhaar": "XXXX-XXXX-1234",
        "pan": "ABCDE1234F",
        "current_company": "TechCorp",
        "designation": "Senior Developer",
    },
    {
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "phone": "9876543211",
        "father_name": "Vijay Sharma",
        "mother_name": "Sunita Sharma",
        "dob": "1996-03-22",
        "education": "MCA",
        "passout_year": "2019",
        "experience": "3 years",
        "skills": "Java, Spring Boot, AWS",
        "aadhaar": "XXXX-XXXX-5678",
        "pan": "FGHIJ5678K",
        "current_company": "InfoSys",
        "designation": "Software Engineer",
    },
]

SEED_COMPANIES = ["Google", "TCS", "Infosys", "Microsoft"]
SEED_ROUNDS = ["Screening", "L1", "L2", "HR", "Technical", "Managerial"]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        existing_users = (await db.execute(select(User))).scalars().all()
        if existing_users:
            print("Database already seeded, skipping.")
            return

        for u in SEED_USERS:
            db.add(User(
                name=u["name"],
                password_hash=pwd_context.hash(u["password"]),
                role=u["role"],
            ))

        for p in SEED_PROFILES:
            db.add(Profile(**p))

        for c in SEED_COMPANIES:
            db.add(Company(name=c))

        for r in SEED_ROUNDS:
            db.add(Round(name=r))

        await db.commit()
        print("Database seeded successfully.")


if __name__ == "__main__":
    asyncio.run(seed())

# Interview Hub

Interview scheduling and management platform.

## Project Structure

```
interview_hub/
├── backend/          # FastAPI + PostgreSQL
├── frontend/         # React + Vite + Tailwind
├── infra/            # (future) Terraform, serverless, etc.
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 17

## Database Setup

```bash
psql -U postgres -c "CREATE DATABASE interview_hub;"
```

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Runs on http://localhost:8000

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173

## Lambda Deployment Package

Build the Lambda deployment zip (run from project root):

```bash
rm -rf lambda-package lambda-deployment.zip
mkdir lambda-package

docker run --rm \
  --platform linux/amd64 \
  --entrypoint /bin/sh \
  -v "$PWD":/var/task \
  -w /var/task \
  public.ecr.aws/lambda/python:3.11 \
  -c "pip install -r requirements.txt -t lambda-package"
```

## Environment Variables

Copy the `.env` files in each directory and update as needed:

- `backend/.env` — database URL, JWT secret
- `frontend/.env` — API base URL

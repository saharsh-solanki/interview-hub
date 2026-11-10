from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import InterviewQuestion, User
from app.schemas.question import QuestionCreate, QuestionResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("", response_model=list[QuestionResponse])
async def list_questions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InterviewQuestion)
        .where(InterviewQuestion.deleted_at.is_(None))
        .order_by(InterviewQuestion.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    question = InterviewQuestion(**data.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(InterviewQuestion).where(
            InterviewQuestion.id == question_id,
            InterviewQuestion.deleted_at.is_(None),
        )
    )
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.deleted_at = datetime.utcnow()
    question.deleted_by = current_user.name
    await db.commit()

from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.models import Interview, InterviewEditHistory, InterviewNote, User
from app.schemas.interview import (
    InterviewCreate,
    InterviewUpdate,
    InterviewResponse,
    InterviewNoteCreate,
    InterviewNoteResponse,
)
from app.api.deps import get_current_user, require_staff

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


def _interview_query():
    return (
        select(Interview)
        .where(Interview.deleted_at.is_(None))
        .options(selectinload(Interview.edit_history))
        .options(selectinload(Interview.notes))
    )


@router.get("", response_model=list[InterviewResponse])
async def list_interviews(
    assigned_to: UUID | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = _interview_query().order_by(Interview.date.desc(), Interview.time.desc())
    if assigned_to:
        q = q.where(Interview.assigned_to == assigned_to)
    result = await db.execute(q)
    return result.scalars().unique().all()


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(interview_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(_interview_query().where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    data: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    interview = Interview(
        **data.model_dump(exclude={"previous_round_id"}),
        previous_round_id=data.previous_round_id,
        created_by=current_user.name,
    )
    db.add(interview)
    await db.flush()

    if data.previous_round_id:
        result = await db.execute(
            select(Interview).where(Interview.id == data.previous_round_id)
        )
        prev = result.scalar_one_or_none()
        if prev:
            prev.next_round_id = interview.id

    await db.commit()

    result = await db.execute(_interview_query().where(Interview.id == interview.id))
    return result.scalar_one()


@router.put("/{interview_id}", response_model=InterviewResponse)
async def update_interview(
    interview_id: UUID,
    data: InterviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(
        _interview_query().where(Interview.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = data.model_dump(exclude_unset=True)

    changed_fields = [
        key for key, value in update_data.items()
        if getattr(interview, key) != value
    ]

    if changed_fields:
        history = InterviewEditHistory(
            interview_id=interview.id,
            edited_by=current_user.name,
            changes=", ".join(changed_fields),
        )
        db.add(history)

    for key, value in update_data.items():
        setattr(interview, key, value)

    await db.commit()

    result = await db.execute(_interview_query().where(Interview.id == interview_id))
    return result.scalar_one()


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.deleted_at.is_(None))
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    interview.deleted_at = datetime.utcnow()
    interview.deleted_by = current_user.name
    await db.commit()


@router.post("/{interview_id}/notes", response_model=InterviewNoteResponse, status_code=status.HTTP_201_CREATED)
async def add_note(
    interview_id: UUID,
    data: InterviewNoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.deleted_at.is_(None))
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Interview not found")

    note = InterviewNote(
        interview_id=interview_id,
        text=data.text,
        author=current_user.name,
        type=data.type,
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.get("/{interview_id}/chain", response_model=list[InterviewResponse])
async def get_round_chain(interview_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(_interview_query().where(Interview.id == interview_id))
    current = result.scalar_one_or_none()
    if not current:
        raise HTTPException(status_code=404, detail="Interview not found")

    while current.previous_round_id:
        result = await db.execute(
            _interview_query().where(Interview.id == current.previous_round_id)
        )
        current = result.scalar_one_or_none()
        if not current:
            break

    chain = []
    while current:
        chain.append(current)
        if current.next_round_id:
            result = await db.execute(
                _interview_query().where(Interview.id == current.next_round_id)
            )
            current = result.scalar_one_or_none()
        else:
            break

    return chain

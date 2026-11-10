from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import Round, User
from app.schemas.round import RoundCreate, RoundResponse
from app.api.deps import require_staff

router = APIRouter(prefix="/api/rounds", tags=["rounds"])


@router.get("", response_model=list[RoundResponse])
async def list_rounds(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Round).where(Round.deleted_at.is_(None)).order_by(Round.name)
    )
    return result.scalars().all()


@router.post("", response_model=RoundResponse, status_code=status.HTTP_201_CREATED)
async def create_round(
    data: RoundCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_staff),
):
    existing = await db.execute(
        select(Round).where(Round.name == data.name, Round.deleted_at.is_(None))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Round already exists")
    round_obj = Round(name=data.name)
    db.add(round_obj)
    await db.commit()
    await db.refresh(round_obj)
    return round_obj


@router.delete("/{round_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_round(
    round_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(
        select(Round).where(Round.id == round_id, Round.deleted_at.is_(None))
    )
    round_obj = result.scalar_one_or_none()
    if not round_obj:
        raise HTTPException(status_code=404, detail="Round not found")
    round_obj.deleted_at = datetime.utcnow()
    round_obj.deleted_by = current_user.name
    await db.commit()

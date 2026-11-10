from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.models import Profile, ProfileEditHistory, User
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.api.deps import get_current_user, require_staff

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


def _profile_query():
    return (
        select(Profile)
        .where(Profile.deleted_at.is_(None))
        .options(selectinload(Profile.edit_history))
    )


@router.get("", response_model=list[ProfileResponse])
async def list_profiles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(_profile_query().order_by(Profile.name))
    return result.scalars().unique().all()


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(profile_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(_profile_query().where(Profile.id == profile_id))
    profile = result.scalars().unique().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    data: ProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    profile = Profile(**data.model_dump(), created_by=current_user.name)
    db.add(profile)
    await db.commit()

    result = await db.execute(_profile_query().where(Profile.id == profile.id))
    return result.scalars().unique().first()


@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: UUID,
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(_profile_query().where(Profile.id == profile_id))
    profile = result.scalars().unique().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = data.model_dump(exclude_unset=True)

    changed_fields = [
        key for key, value in update_data.items()
        if getattr(profile, key) != value
    ]

    if changed_fields:
        history = ProfileEditHistory(
            profile_id=profile.id,
            edited_by=current_user.name,
            changes=", ".join(changed_fields),
        )
        db.add(history)

    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.commit()
    db.expire_all()

    result = await db.execute(_profile_query().where(Profile.id == profile_id))
    return result.scalars().unique().first()


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    profile_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(
        select(Profile).where(Profile.id == profile_id, Profile.deleted_at.is_(None))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.deleted_at = datetime.utcnow()
    profile.deleted_by = current_user.name
    await db.commit()

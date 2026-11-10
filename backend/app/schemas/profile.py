from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class ProfileBase(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    father_name: str | None = None
    mother_name: str | None = None
    dob: str | None = None
    education: str | None = None
    passout_year: str | None = None
    experience: str | None = None
    skills: str | None = None
    aadhaar: str | None = None
    pan: str | None = None
    current_company: str | None = None
    designation: str | None = None
    resume_link: str | None = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    name: str | None = None


class ProfileEditHistoryResponse(BaseModel):
    id: UUID
    edited_by: str
    edited_at: datetime
    changes: str | None = None

    model_config = {"from_attributes": True}


class ProfileResponse(ProfileBase):
    id: UUID
    created_by: str | None = None
    created_at: datetime
    deleted_at: datetime | None = None
    deleted_by: str | None = None
    edit_history: list[ProfileEditHistoryResponse] = []

    model_config = {"from_attributes": True}

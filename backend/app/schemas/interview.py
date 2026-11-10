from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class InterviewNoteBase(BaseModel):
    text: str
    type: str = "note"


class InterviewNoteCreate(InterviewNoteBase):
    pass


class InterviewNoteResponse(InterviewNoteBase):
    id: UUID
    interview_id: UUID
    author: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EditHistoryResponse(BaseModel):
    id: UUID
    edited_by: str
    edited_at: datetime
    changes: str | None = None

    model_config = {"from_attributes": True}


class InterviewBase(BaseModel):
    profile_id: UUID
    assigned_to: UUID
    round: str
    date: str
    time: str
    meeting_link: str | None = None
    jd_link: str | None = None
    resume_link: str | None = None
    company: str | None = None
    status: str = "Scheduled"
    description: str | None = None


class InterviewCreate(InterviewBase):
    previous_round_id: UUID | None = None


class InterviewUpdate(BaseModel):
    profile_id: UUID | None = None
    assigned_to: UUID | None = None
    round: str | None = None
    date: str | None = None
    time: str | None = None
    meeting_link: str | None = None
    jd_link: str | None = None
    resume_link: str | None = None
    company: str | None = None
    status: str | None = None
    description: str | None = None


class InterviewResponse(InterviewBase):
    id: UUID
    created_by: str | None = None
    created_at: datetime
    deleted_at: datetime | None = None
    deleted_by: str | None = None
    previous_round_id: UUID | None = None
    next_round_id: UUID | None = None
    edit_history: list[EditHistoryResponse] = []
    notes: list[InterviewNoteResponse] = []

    model_config = {"from_attributes": True}

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class QuestionBase(BaseModel):
    title: str | None = None
    question: str
    category: str | None = None
    difficulty: str | None = None
    answer: str | None = None


class QuestionCreate(QuestionBase):
    pass


class QuestionResponse(QuestionBase):
    id: UUID
    created_at: datetime
    deleted_at: datetime | None = None
    deleted_by: str | None = None

    model_config = {"from_attributes": True}

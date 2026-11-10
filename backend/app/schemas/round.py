from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class RoundBase(BaseModel):
    name: str


class RoundCreate(RoundBase):
    pass


class RoundResponse(RoundBase):
    id: UUID
    created_at: datetime
    deleted_at: datetime | None = None
    deleted_by: str | None = None

    model_config = {"from_attributes": True}

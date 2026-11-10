from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class CompanyBase(BaseModel):
    name: str


class CompanyCreate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: UUID
    created_at: datetime
    deleted_at: datetime | None = None
    deleted_by: str | None = None

    model_config = {"from_attributes": True}

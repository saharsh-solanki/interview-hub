from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class UserBase(BaseModel):
    name: str
    role: str = "interviewer"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    deleted_at: datetime | None = None
    deleted_by: str | None = None

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str

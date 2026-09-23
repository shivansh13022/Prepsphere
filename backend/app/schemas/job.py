from datetime import datetime

from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    company: str | None = None
    location: str | None = None
    description: str
    source_url: str | None = None


class JobResponse(BaseModel):
    id: int
    title: str
    company: str | None
    location: str | None
    description: str
    source_url: str | None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
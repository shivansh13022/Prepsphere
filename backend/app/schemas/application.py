from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ApplicationStatus = Literal[
    "saved",
    "applied",
    "oa",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
]


ApplicationSource = Literal[
    "manual",
    "adzuna",
]


class ApplicationCreate(BaseModel):
    job_title: str = Field(
        min_length=1,
        max_length=200,
    )

    company: str = Field(
        min_length=1,
        max_length=200,
    )

    location: str | None = Field(
        default=None,
        max_length=200,
    )

    job_url: str | None = None

    external_job_id: str | None = Field(
        default=None,
        max_length=100,
    )

    source: ApplicationSource = "manual"

    status: ApplicationStatus = "applied"

    notes: str | None = None


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus | None = None
    notes: str | None = None


class ApplicationResponse(BaseModel):
    id: int

    job_title: str
    company: str

    location: str | None
    job_url: str | None

    external_job_id: str | None

    source: ApplicationSource
    status: ApplicationStatus

    notes: str | None

    applied_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
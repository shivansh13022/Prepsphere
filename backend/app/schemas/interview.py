from datetime import datetime

from pydantic import BaseModel, Field
from typing import Literal

class InterviewSessionCreate(BaseModel):
    job_id: int | None = None
    focus: str | None = None

    difficulty: str = Field(
        default="medium",
        pattern="^(easy|medium|hard)$",
    )
    duration_minutes: Literal[15, 30, 45, 60] = 30


class InterviewSessionResponse(BaseModel):
    id: int
    user_id: int
    job_id: int | None
    focus: str | None
    difficulty: str
    duration_minutes: int
    status: str
    started_at: datetime
    completed_at: datetime | None

    model_config = {
        "from_attributes": True
    }

class InterviewStartResponse(BaseModel):
    interview_id: int
    status: str
    current_topic: str
    question: str
    questions_asked: int

class InterviewAnswerRequest(BaseModel):
    answer: str


class InterviewAnswerResponse(BaseModel):
    interview_id: int
    status: str
    current_topic: str | None
    question: str | None
    questions_asked: int
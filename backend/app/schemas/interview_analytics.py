from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class OverallPerformance(BaseModel):
    average_score: float = Field(ge=0, le=10)
    latest_score: float = Field(ge=0, le=10)
    technical_knowledge: float = Field(ge=0, le=10)
    completeness: float = Field(ge=0, le=10)
    depth: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)


class InterviewTrendPoint(BaseModel):
    interview_id: int
    score: float = Field(ge=0, le=10)
    completed_at: datetime


class TopicAnalytics(BaseModel):
    topic: str

    average_score: float = Field(ge=0, le=10)
    latest_score: float = Field(ge=0, le=10)

    # Trend intelligence
    previous_score: float | None = Field(
        default=None,
        ge=0,
        le=10,
    )
    change: float | None = None

    trend: Literal[
        "improving",
        "stable",
        "declining",
        "insufficient_data",
    ]

    priority: Literal[
        "high",
        "medium",
        "low",
    ]

    interviews: int = Field(ge=1)

    technical_knowledge: float = Field(ge=0, le=10)
    completeness: float = Field(ge=0, le=10)
    depth: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)


class InterviewAnalytics(BaseModel):
    total_interviews: int = Field(ge=0)

    overall: OverallPerformance | None = None

    interview_trend: list[InterviewTrendPoint] = Field(
        default_factory=list
    )

    topic_performance: list[TopicAnalytics] = Field(
        default_factory=list
    )
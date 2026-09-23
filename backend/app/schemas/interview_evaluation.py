from typing import Literal

from pydantic import BaseModel, Field


class InterviewEvaluation(BaseModel):
    score: float = Field(ge=0, le=10)

    correctness: float = Field(ge=0, le=10)
    completeness: float = Field(ge=0, le=10)
    depth: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)

    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_concepts: list[str] = Field(default_factory=list)

    decision: Literal[
        "follow_up",
        "same_level",
        "go_deeper",
        "next_topic",
    ]
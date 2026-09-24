from typing import Literal

from pydantic import BaseModel, Field


class InterviewEvaluation(BaseModel):
    correctness: float = Field(ge=0, le=10)
    completeness: float = Field(ge=0, le=10)
    depth: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)

    score: float = Field(ge=0, le=10)

    strengths: list[str]
    weaknesses: list[str]
    missing_concepts: list[str]

    decision: Literal[
        "follow_up",
        "same_level",
        "go_deeper",
        "next_concept",
        "next_topic",
    ]
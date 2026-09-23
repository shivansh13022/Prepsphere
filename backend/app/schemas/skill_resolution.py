from typing import Literal

from pydantic import BaseModel, Field


class SkillResolutionDecision(BaseModel):
    raw_skill: str

    resolution_type: Literal[
        "existing_skill",
        "new_skill",
    ]

    canonical_name: str

    reasoning: str


class BatchSkillResolutionResponse(BaseModel):
    resolutions: list[SkillResolutionDecision] = Field(
        default_factory=list
    )
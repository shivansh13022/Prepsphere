from pydantic import BaseModel, Field


class InterviewPlan(BaseModel):
    interview_type: str
    target_role: str | None = None
    difficulty: str

    core_topics: list[str] = Field(default_factory=list)
    gap_topics: list[str] = Field(default_factory=list)
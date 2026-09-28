from pydantic import BaseModel, Field


class JobAnalysisData(BaseModel):
    role_summary: str | None = None

    required_skills: list[str] = Field(
        default_factory=list
    )

    preferred_skills: list[str] = Field(
        default_factory=list
    )

    required_experience: str | None = None

    education_requirements: list[str] = Field(
        default_factory=list
    )

    responsibilities: list[str] = Field(
        default_factory=list
    )

    keywords: list[str] = Field(
        default_factory=list
    )
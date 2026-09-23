from pydantic import BaseModel, Field


class JobMatchResult(BaseModel):
    match_score: float
    relevance:str

    matched_required_skills: list[str] = Field(default_factory=list)
    missing_required_skills: list[str] = Field(default_factory=list)

    matched_preferred_skills: list[str] = Field(default_factory=list)
    missing_preferred_skills: list[str] = Field(default_factory=list)

    candidate_skills: list[str] = Field(default_factory=list)
    job_required_skills: list[str] = Field(default_factory=list)
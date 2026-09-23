from pydantic import BaseModel, Field


class InterviewReport(BaseModel):
    overall_score: float = Field(ge=0, le=10)

    technical_knowledge: float = Field(ge=0, le=10)
    completeness: float = Field(ge=0, le=10)
    depth: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)

    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    topics_to_improve: list[str] = Field(default_factory=list)

    summary: str
    recommendations: list[str] = Field(default_factory=list)

    model_config = {
        "from_attributes": True
    }

class InterviewReportSummary(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    topics_to_improve: list[str] = Field(default_factory=list)

    summary: str

    recommendations: list[str] = Field(default_factory=list)
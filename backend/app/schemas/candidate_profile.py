from pydantic import BaseModel, ConfigDict


class CandidateProfileBaseResponse(BaseModel):
    headline: str | None = None
    summary: str | None = None
    target_role: str | None = None
    experience_level: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CandidateSkillResponse(BaseModel):
    name: str


class CandidateExperienceResponse(BaseModel):
    company: str
    role: str
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CandidateProjectResponse(BaseModel):
    name: str
    description: str | None = None
    project_url: str | None = None
    github_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CandidateProfileResponse(BaseModel):
    headline: str | None = None
    summary: str | None = None
    target_role: str | None = None
    experience_level: str | None = None

    skills: list[CandidateSkillResponse]
    experience: list[CandidateExperienceResponse]
    projects: list[CandidateProjectResponse]

class CandidateProfileUpdate(BaseModel):
    headline: str | None = None
    summary: str | None = None
    target_role: str | None = None
    experience_level: str | None = None
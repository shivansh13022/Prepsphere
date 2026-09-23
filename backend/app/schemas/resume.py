from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeListResponse(BaseModel):
    id: int
    original_filename: str
    status: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EducationResponse(BaseModel):
    id: int
    degree: str | None
    field_of_study: str | None
    institution: str | None
    grade: str | None
    start_year: int | None
    end_year: int | None

    model_config = ConfigDict(from_attributes=True)


class ExperienceResponse(BaseModel):
    id: int
    company: str
    role: str
    location: str | None
    start_date: str | None
    end_date: str | None
    description: str | None

    model_config = ConfigDict(from_attributes=True)


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    project_url: str | None
    github_url: str | None

    model_config = ConfigDict(from_attributes=True)


class SkillResponse(BaseModel):
    id: int
    name: str
    source: str | None

    model_config = ConfigDict(from_attributes=True)


class CourseResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class CertificationResponse(BaseModel):
    id: int
    name: str
    issuer: str | None
    issue_date: str | None

    model_config = ConfigDict(from_attributes=True)


class AchievementResponse(BaseModel):
    id: int
    description: str

    model_config = ConfigDict(from_attributes=True)


class ResumeDetailResponse(BaseModel):
    id: int
    original_filename: str
    status: str
    uploaded_at: datetime

    education: list[EducationResponse]
    experience: list[ExperienceResponse]
    projects: list[ProjectResponse]
    skills: list[SkillResponse]
    courses: list[CourseResponse]
    certifications: list[CertificationResponse]
    achievements: list[AchievementResponse]
from pydantic import BaseModel


class EducationData(BaseModel):
    degree: str | None = None
    field_of_study: str | None = None
    institution: str | None = None
    grade: str | None = None
    start_year: int | None = None
    end_year: int | None = None


class ExperienceData(BaseModel):
    company: str | None = None
    role: str | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None
    technologies: list[str] = []


class ProjectData(BaseModel):
    name: str | None = None
    description: str | None = None
    project_url: str | None = None
    github_url: str | None = None
    technologies: list[str] = []

class ResumeParsedData(BaseModel):
    summary: str | None = None
    education: list[EducationData] = []
    experience: list[ExperienceData] = []
    projects: list[ProjectData] = []
    skills: list[str] = []
    courses: list[str] = []
    certifications: list[str] = []
    achievements: list[str] = []
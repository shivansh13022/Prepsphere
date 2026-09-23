from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.achievement import Achievement
from app.models.certification import Certification
from app.models.course import Course
from app.models.education import Education
from app.models.experience import Experience
from app.models.project import Project
from app.models.skill import Skill
from app.models.skill_catalog import SkillCatalog

from app.schemas.resume_parser import ResumeParsedData

from app.services.skill_normalization_service import canonicalize_skills


def save_parsed_resume_data(
    db: Session,
    user_id: int,
    resume_id: int,
    data: ResumeParsedData,
) -> None:

    # --------------------------------------------------
    # Education
    # --------------------------------------------------

    for item in data.education:
        db.add(
            Education(
                user_id=user_id,
                resume_id=resume_id,
                degree=item.degree,
                field_of_study=item.field_of_study,
                institution=item.institution,
                grade=item.grade,
                start_year=item.start_year,
                end_year=item.end_year,
            )
        )

    # --------------------------------------------------
    # Experience
    # --------------------------------------------------

    for item in data.experience:
        db.add(
            Experience(
                user_id=user_id,
                resume_id=resume_id,
                company=item.company or "Unknown",
                role=item.role or "Unknown",
                location=item.location,
                start_date=item.start_date,
                end_date=item.end_date,
                description=item.description,
            )
        )

    # --------------------------------------------------
    # Projects
    # --------------------------------------------------

    for item in data.projects:
        db.add(
            Project(
                user_id=user_id,
                resume_id=resume_id,
                name=item.name or "Untitled Project",
                description=item.description,
                project_url=item.project_url,
                github_url=item.github_url,
            )
        )

    # --------------------------------------------------
    # Skills
    # --------------------------------------------------

    canonical_skills = canonicalize_skills(
        db=db,
        skills=data.skills,
    )

    for canonical_name in canonical_skills:

        skill_catalog = db.scalar(
            select(SkillCatalog).where(
                SkillCatalog.normalized_name
                == canonical_name.strip().lower()
            )
        )

        if skill_catalog is None:
            continue

        db.add(
            Skill(
                user_id=user_id,
                resume_id=resume_id,
                name=canonical_name,
                source="resume",
                skill_catalog_id=skill_catalog.id,
            )
        )

    # --------------------------------------------------
    # Courses
    # --------------------------------------------------

    for course_name in data.courses:
        db.add(
            Course(
                user_id=user_id,
                resume_id=resume_id,
                name=course_name,
            )
        )

    # --------------------------------------------------
    # Certifications
    # --------------------------------------------------

    for certification_name in data.certifications:
        db.add(
            Certification(
                user_id=user_id,
                resume_id=resume_id,
                name=certification_name,
            )
        )

    # --------------------------------------------------
    # Achievements
    # --------------------------------------------------

    for achievement_text in data.achievements:
        db.add(
            Achievement(
                user_id=user_id,
                resume_id=resume_id,
                description=achievement_text,
            )
        )
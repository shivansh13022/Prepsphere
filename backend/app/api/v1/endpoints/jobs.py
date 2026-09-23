import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db

from app.models.job import Job
from app.models.job_analysis import JobAnalysis
from app.models.skill import Skill
from app.models.skill_catalog import SkillCatalog
from app.models.user import User

from app.schemas.job import JobCreate, JobResponse
from app.schemas.job_analysis import JobAnalysisData
from app.schemas.job_match import JobMatchResult

from app.services.job_analysis_service import analyze_job_description
from app.services.job_matching_service import calculate_job_match
from app.services.skill_normalization_service import canonicalize_skills


router = APIRouter()


@router.post(
    "/jobs",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = Job(
        user_id=current_user.id,
        title=job_data.title,
        company=job_data.company,
        location=job_data.location,
        description=job_data.description,
        source_url=job_data.source_url,
        status="saved",
    )

    try:
        db.add(job)
        db.commit()
        db.refresh(job)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save job.",
        )

    return job


@router.get(
    "/jobs",
    response_model=list[JobResponse],
)
def get_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    jobs = db.scalars(
        select(Job)
        .where(
            Job.user_id == current_user.id
        )
        .order_by(Job.created_at.desc())
    ).all()

    return jobs


@router.get(
    "/jobs/{job_id}",
    response_model=JobResponse,
)
def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.scalar(
        select(Job).where(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job


@router.post(
    "/jobs/{job_id}/analyze",
    response_model=JobAnalysisData,
)
def analyze_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Make sure the job belongs to the logged-in user
    job = db.scalar(
        select(Job).where(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Return cached analysis if it already exists
    existing_analysis = db.scalar(
        select(JobAnalysis).where(
            JobAnalysis.job_id == job.id
        )
    )

    if existing_analysis:
        return JobAnalysisData(
            role_summary=existing_analysis.role_summary,
            required_skills=json.loads(
                existing_analysis.required_skills or "[]"
            ),
            preferred_skills=json.loads(
                existing_analysis.preferred_skills or "[]"
            ),
            responsibilities=json.loads(
                existing_analysis.responsibilities or "[]"
            ),
            required_experience=existing_analysis.required_experience,
            education_requirements=json.loads(
                existing_analysis.education_requirements or "[]"
            ),
            keywords=json.loads(
                existing_analysis.keywords or "[]"
            ),
        )

    # No cached analysis -> call Gemini
    analysis = analyze_job_description(
        job_title=job.title,
        job_description=job.description,
    )

    # Normalize JD skills once before saving
    canonical_required_skills = canonicalize_skills(
        db=db,
        skills=analysis.required_skills,
    )

    canonical_preferred_skills = canonicalize_skills(
        db=db,
        skills=analysis.preferred_skills,
    )

    job_analysis = JobAnalysis(
        job_id=job.id,
        role_summary=analysis.role_summary,

        # Keep original extracted skills
        required_skills=json.dumps(
            analysis.required_skills
        ),

        preferred_skills=json.dumps(
            analysis.preferred_skills
        ),

        # Store canonical versions for matching
        canonical_required_skills=json.dumps(
            canonical_required_skills
        ),

        canonical_preferred_skills=json.dumps(
            canonical_preferred_skills
        ),

        responsibilities=json.dumps(
            analysis.responsibilities
        ),

        required_experience=analysis.required_experience,

        education_requirements=json.dumps(
            analysis.education_requirements
        ),

        keywords=json.dumps(
            analysis.keywords
        ),
    )

    try:
        db.add(job_analysis)
        db.commit()
        db.refresh(job_analysis)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save job analysis.",
        )

    return analysis


@router.get(
    "/jobs/{job_id}/match",
    response_model=JobMatchResult,
)
def get_job_match(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Make sure this job belongs to the current user
    job = db.scalar(
        select(Job).where(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Matching requires structured JD analysis first
    job_analysis = db.scalar(
        select(JobAnalysis).where(
            JobAnalysis.job_id == job.id
        )
    )

    if not job_analysis:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Job must be analyzed before matching.",
        )

    # Candidate skills already have skill_catalog_id,
    # so fetch canonical names directly from the catalog
    canonical_candidate_skills = sorted(
        set(
            db.scalars(
                select(SkillCatalog.canonical_name)
                .join(
                    Skill,
                    Skill.skill_catalog_id == SkillCatalog.id,
                )
                .where(
                    Skill.user_id == current_user.id,
                    Skill.skill_catalog_id.is_not(None),
                )
            ).all()
        )
    )

    # JD canonical skills are already stored in the database
    canonical_required_skills = json.loads(
        job_analysis.canonical_required_skills or "[]"
    )

    canonical_preferred_skills = json.loads(
        job_analysis.canonical_preferred_skills or "[]"
    )

    # Fully deterministic DB-based matching
    return calculate_job_match(
        candidate_skills=canonical_candidate_skills,
        required_skills=canonical_required_skills,
        preferred_skills=canonical_preferred_skills,
    )
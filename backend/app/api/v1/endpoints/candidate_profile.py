from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.candidate_profile import CandidateProfile
from app.models.experience import Experience
from app.models.project import Project
from app.models.skill import Skill
from app.models.user import User
from app.schemas.candidate_profile import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
)
from app.schemas.candidate_profile import CandidateProfileBaseResponse


router = APIRouter()


@router.get(
    "/candidate-profile",
    response_model=CandidateProfileResponse,
)
def get_candidate_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    skills = db.scalars(
        select(Skill).where(
            Skill.user_id == current_user.id
        )
    ).all()

    experience = db.scalars(
        select(Experience).where(
            Experience.user_id == current_user.id
        )
    ).all()

    projects = db.scalars(
        select(Project).where(
            Project.user_id == current_user.id
        )
    ).all()

    unique_skill_names = sorted(
        {skill.name for skill in skills}
    )

    return {
        "headline": profile.headline if profile else None,
        "summary": profile.summary if profile else None,
        "target_role": profile.target_role if profile else None,
        "experience_level": profile.experience_level if profile else None,
        "skills": [
            {"name": skill_name}
            for skill_name in unique_skill_names
        ],
        "experience": experience,
        "projects": projects,
    }


@router.put(
    "/candidate-profile",
    response_model=CandidateProfileBaseResponse,
)
def update_candidate_profile(
    profile_data: CandidateProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    if not profile:
        profile = CandidateProfile(
            user_id=current_user.id,
        )
        db.add(profile)

    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile
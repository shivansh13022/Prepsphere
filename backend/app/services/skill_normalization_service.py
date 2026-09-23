from sqlalchemy.orm import Session

from app.services.batch_skill_resolver_service import batch_resolve_skills


def canonicalize_skills(
    db: Session,
    skills: list[str],
) -> list[str]:

    if not skills:
        return []

    # Remove obvious duplicates before resolving
    unique_skills = list(
        dict.fromkeys(
            skill.strip()
            for skill in skills
            if skill and skill.strip()
        )
    )

    resolutions = batch_resolve_skills(
        db=db,
        raw_skills=unique_skills,
    )

    canonical_skills = [
        resolution.canonical_name
        for resolution in resolutions
    ]

    # Deduplicate canonical results
    return list(
        dict.fromkeys(canonical_skills)
    )
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill_alias import SkillAlias
from app.models.skill_catalog import SkillCatalog
from app.services.skill_resolver_service import normalize_skill_name


def cache_existing_skill_alias(
    db: Session,
    raw_skill: str,
    canonical_name: str,
) -> None:
    normalized_alias = normalize_skill_name(raw_skill)

    # Already known as canonical
    existing_canonical = db.scalar(
        select(SkillCatalog).where(
            SkillCatalog.normalized_name == normalized_alias
        )
    )

    if existing_canonical:
        return

    # Alias already exists
    existing_alias = db.scalar(
        select(SkillAlias).where(
            SkillAlias.normalized_alias == normalized_alias
        )
    )

    if existing_alias:
        return

    canonical_skill = db.scalar(
        select(SkillCatalog).where(
            SkillCatalog.canonical_name == canonical_name
        )
    )

    if canonical_skill is None:
        return

    db.add(
        SkillAlias(
            skill_id=canonical_skill.id,
            alias=raw_skill.strip(),
            normalized_alias=normalized_alias,
        )
    )


def cache_new_skill(
    db: Session,
    canonical_name: str,
) -> SkillCatalog:
    normalized_name = normalize_skill_name(canonical_name)

    existing = db.scalar(
        select(SkillCatalog).where(
            SkillCatalog.normalized_name == normalized_name
        )
    )

    if existing:
        return existing

    new_skill = SkillCatalog(
        canonical_name=canonical_name.strip(),
        normalized_name=normalized_name,
        source="dynamic",
    )

    db.add(new_skill)
    db.flush()

    return new_skill
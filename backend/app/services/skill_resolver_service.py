from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill_alias import SkillAlias
from app.models.skill_catalog import SkillCatalog


def normalize_skill_name(skill_name: str) -> str:
    return skill_name.strip().lower()


def resolve_skill(
    db: Session,
    skill_name: str,
) -> SkillCatalog | None:
    normalized_name = normalize_skill_name(skill_name)

    # 1. Try canonical skill first
    skill = db.scalar(
        select(SkillCatalog).where(
            SkillCatalog.normalized_name == normalized_name
        )
    )

    if skill:
        return skill

    # 2. Try alias lookup
    alias = db.scalar(
        select(SkillAlias).where(
            SkillAlias.normalized_alias == normalized_name
        )
    )

    if alias is None:
        return None

    # 3. Resolve alias -> canonical skill
    return db.get(SkillCatalog, alias.skill_id)
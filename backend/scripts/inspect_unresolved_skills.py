from rapidfuzz import fuzz, process
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.skill import Skill
from app.models.skill_catalog import SkillCatalog


def inspect_unresolved_skills():
    db = SessionLocal()

    try:
        unresolved_skills = db.scalars(
            select(Skill).where(
                Skill.skill_catalog_id.is_(None)
            )
        ).all()

        catalog_names = list(
            db.scalars(
                select(SkillCatalog.canonical_name)
            ).all()
        )

        unique_names = sorted(
            {
                skill.name.strip()
                for skill in unresolved_skills
                if skill.name and skill.name.strip()
            }
        )

        for raw_skill in unique_names:
            matches = process.extract(
                raw_skill,
                catalog_names,
                scorer=fuzz.WRatio,
                limit=5,
            )

            print()
            print(f"RAW: {raw_skill}")

            for candidate, score, _ in matches:
                print(
                    f"  {score:.1f} -> {candidate}"
                )

    finally:
        db.close()


if __name__ == "__main__":
    inspect_unresolved_skills()
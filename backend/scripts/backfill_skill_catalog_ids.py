from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.skill import Skill
from app.services.skill_resolver_service import resolve_skill


def backfill_skill_catalog_ids():
    db = SessionLocal()

    updated = 0
    unresolved = 0
    skipped = 0

    try:
        skills = db.scalars(
            select(Skill)
        ).all()

        for skill in skills:

            # Already linked
            if skill.skill_catalog_id is not None:
                skipped += 1
                continue

            resolved_skill = resolve_skill(
                db=db,
                skill_name=skill.name,
            )

            if resolved_skill:
                skill.skill_catalog_id = resolved_skill.id
                updated += 1
            else:
                unresolved += 1
                print(f"Unresolved: {skill.name}")

        db.commit()

        print()
        print(f"Updated: {updated}")
        print(f"Skipped: {skipped}")
        print(f"Unresolved: {unresolved}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    backfill_skill_catalog_ids()
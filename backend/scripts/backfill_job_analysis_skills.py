import json

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.job_analysis import JobAnalysis
from app.services.skill_normalization_service import canonicalize_skills


def backfill_job_analysis_skills():
    db = SessionLocal()

    updated = 0
    skipped = 0

    try:
        analyses = db.scalars(
            select(JobAnalysis)
        ).all()

        for analysis in analyses:
            if (
                analysis.canonical_required_skills is not None
                and analysis.canonical_preferred_skills is not None
            ):
                skipped += 1
                continue

            required_skills = json.loads(
                analysis.required_skills or "[]"
            )

            preferred_skills = json.loads(
                analysis.preferred_skills or "[]"
            )

            canonical_required_skills = canonicalize_skills(
                db=db,
                skills=required_skills,
            )

            canonical_preferred_skills = canonicalize_skills(
                db=db,
                skills=preferred_skills,
            )

            analysis.canonical_required_skills = json.dumps(
                canonical_required_skills
            )

            analysis.canonical_preferred_skills = json.dumps(
                canonical_preferred_skills
            )

            updated += 1

        db.commit()

        print(f"Updated: {updated}")
        print(f"Skipped: {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    backfill_job_analysis_skills()
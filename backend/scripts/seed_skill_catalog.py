from pathlib import Path

import pandas as pd
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.skill_catalog import SkillCatalog


BASE_DIR = Path(__file__).resolve().parent.parent
CSV_FILE = BASE_DIR / "data" / "prepsphere_skill_catalog.csv"


def main():
    df = pd.read_csv(CSV_FILE)

    db = SessionLocal()

    added = 0
    skipped = 0

    try:
        for _, row in df.iterrows():
            canonical_name = str(row["canonical_name"]).strip()
            normalized_name = str(row["normalized_name"]).strip().lower()

            existing = db.scalar(
                select(SkillCatalog).where(
                    SkillCatalog.normalized_name == normalized_name
                )
            )

            if existing:
                skipped += 1
                continue

            skill = SkillCatalog(
                canonical_name=canonical_name,
                normalized_name=normalized_name,
                source="onet_prepsphere",
            )

            db.add(skill)
            added += 1

        db.commit()

        print(f"Added: {added}")
        print(f"Skipped: {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
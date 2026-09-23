from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.skill_catalog import SkillCatalog
from app.models.skill_alias import SkillAlias


CURATED_SKILLS = [
    "Guidewire",
    "Gosu",
    "Apache FOP",
    "Geoapify API",
    "Tailwind CSS",
    "React Slick",
    "MERN Stack",
    "Redux Toolkit",
    "Axios",
    "Appwrite",
    "React Hook Form",
    "Redux",
    "Express.js",
    "Neon",
    "Prisma",
    "Drizzle ORM",
    "Amazon SES",
    "Firebase",
    "API Testing",
    "Rust",
    "Blockchain",
    "SQL",
    "Spring Batch",
    "Data Structures",
    "Algorithms",
    "Object-Oriented Programming",
    "DBMS",
    "Computer Networks",
    "Operating Systems",
]


ALIASES = {
    "TailwindCSS": "Tailwind CSS",
    "React-Slick": "React Slick",

    "Express": "Express.js",

    "NeonDB": "Neon",

    "Drizzle": "Drizzle ORM",

    "SES": "Amazon SES",

    "Spring-batch": "Spring Batch",

    "OOPs": "Object-Oriented Programming",

    # Existing O*NET canonical CSS entry
    "CSS": "Cascading style sheets CSS",
}


def normalize(value: str) -> str:
    return value.strip().lower()


def seed_curated_skills():
    db = SessionLocal()

    added_skills = 0
    skipped_skills = 0
    added_aliases = 0
    skipped_aliases = 0

    try:
        # ---------------------------------------------
        # Add missing canonical skills
        # ---------------------------------------------
        for canonical_name in CURATED_SKILLS:
            normalized_name = normalize(canonical_name)

            existing = db.scalar(
                select(SkillCatalog).where(
                    SkillCatalog.normalized_name == normalized_name
                )
            )

            if existing:
                skipped_skills += 1
                continue

            db.add(
                SkillCatalog(
                    canonical_name=canonical_name,
                    normalized_name=normalized_name,
                    source="prepsphere_curated",
                )
            )

            added_skills += 1

        # Flush so newly created skills receive IDs
        db.flush()

        # ---------------------------------------------
        # Add aliases
        # ---------------------------------------------
        for alias, canonical_name in ALIASES.items():
            canonical_skill = db.scalar(
                select(SkillCatalog).where(
                    SkillCatalog.normalized_name
                    == normalize(canonical_name)
                )
            )

            if not canonical_skill:
                print(
                    f"Canonical skill missing: "
                    f"{alias} -> {canonical_name}"
                )
                continue

            normalized_alias = normalize(alias)

            existing_alias = db.scalar(
                select(SkillAlias).where(
                    SkillAlias.normalized_alias
                    == normalized_alias
                )
            )

            if existing_alias:
                skipped_aliases += 1
                continue

            db.add(
                SkillAlias(
                    skill_id=canonical_skill.id,
                    alias=alias,
                    normalized_alias=normalized_alias,
                )
            )

            added_aliases += 1

        db.commit()

        print()
        print(f"Added canonical skills: {added_skills}")
        print(f"Skipped canonical skills: {skipped_skills}")
        print(f"Added aliases: {added_aliases}")
        print(f"Skipped aliases: {skipped_aliases}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_curated_skills()
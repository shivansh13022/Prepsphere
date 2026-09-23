from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.skill_alias import SkillAlias
from app.models.skill_catalog import SkillCatalog


ALIASES = {
    # React
    "ReactJS": "React",
    "React.js": "React",

    # PostgreSQL
    "Postgres": "PostgreSQL",
    "PostgreSQL DB": "PostgreSQL",

    # Kubernetes
    "K8s": "Kubernetes",

    # Node
    "NodeJS": "Node.js",
    "Node": "Node.js",

    # JavaScript / TypeScript
    "JS": "JavaScript",
    "TS": "TypeScript",

    # Bitbucket
    "Bitbucket": "Atlassian Bitbucket",

    # Go
    "Golang": "Go",

    # REST
    "REST APIs": "RESTful API",

    # AWS
    "AWS EC2": "Amazon Elastic Compute Cloud EC2",

    # XML
    "PCF XML": "Extensible markup language XML",

    # Testing
    "Unit Testing": "Unit testing software",
    "Integration Testing": "Integration testing software",

    # XSL
    "XSL-FO": "Extensible stylesheet language XSL",
}


def normalize(value: str) -> str:
    return value.strip().lower()


def seed_aliases():
    db = SessionLocal()

    added = 0
    skipped = 0
    missing_canonical = 0

    try:
        for alias, canonical_name in ALIASES.items():

            canonical_skill = db.scalar(
                select(SkillCatalog).where(
                    SkillCatalog.canonical_name == canonical_name
                )
            )

            if not canonical_skill:
                print(
                    f"Canonical skill not found: "
                    f"{canonical_name} <- {alias}"
                )
                missing_canonical += 1
                continue

            normalized_alias = normalize(alias)

            existing_alias = db.scalar(
                select(SkillAlias).where(
                    SkillAlias.normalized_alias == normalized_alias
                )
            )

            if existing_alias:
                skipped += 1
                continue

            db.add(
                SkillAlias(
                    skill_id=canonical_skill.id,
                    alias=alias,
                    normalized_alias=normalized_alias,
                )
            )

            added += 1

        db.commit()

        print()
        print(f"Added aliases: {added}")
        print(f"Skipped aliases: {skipped}")
        print(f"Missing canonical skills: {missing_canonical}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_aliases()
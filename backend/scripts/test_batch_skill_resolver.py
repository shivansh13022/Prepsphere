from app.db.session import SessionLocal
from app.services.batch_skill_resolver_service import (
    batch_resolve_skills,
)


def main():

    test_skills = [
        "React",
        "ReactJS",
        "Postgres",
        "K8s",
        "Docker",
        "Fast API",
        "Lang Graph",
        "SpringBoot",
        "SomeNewFramework",
    ]

    db = SessionLocal()

    try:

        results = batch_resolve_skills(
            db=db,
            raw_skills=test_skills,
        )

        for result in results:

            print("\n" + "=" * 60)

            print(
                f"Raw skill: {result.raw_skill}"
            )

            print(
                f"Resolution: {result.resolution_type}"
            )

            print(
                f"Canonical: {result.canonical_name}"
            )

            print(
                f"Reasoning: {result.reasoning}"
            )

    finally:
        db.close()


if __name__ == "__main__":
    main()
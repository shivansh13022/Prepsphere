from app.db.session import SessionLocal
from app.services.dynamic_skill_resolver_service import resolve_unknown_skill


def main():
    db = SessionLocal()

    test_skills = [
        "React JS",
        "Postgres",
        "K8s",
        "Fast API",
        "Lang Graph",
        "SpringBoot",
        "SomeNewFramework",
    ]

    try:
        for raw_skill in test_skills:
            result = resolve_unknown_skill(
                db=db,
                raw_skill=raw_skill,
            )

            print("\n" + "=" * 60)
            print(f"Raw skill: {raw_skill}")
            print(f"Resolution: {result.resolution_type}")
            print(f"Canonical: {result.canonical_name}")
            print(f"Reasoning: {result.reasoning}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
from app.db.session import SessionLocal
from app.services.skill_resolver_service import resolve_skill


def main():
    db = SessionLocal()

    try:
        test_skills = [
            "React",
            "ReactJS",
            "React.js",
            "Postgres",
            "PostgreSQL",
            "K8s",
            "Docker",
            "FastAPI",
            "LangGraph",
            "SomeRandomTechnology",
        ]

        for raw_skill in test_skills:
            resolved = resolve_skill(db, raw_skill)

            if resolved:
                print(
                    f"{raw_skill:<25} -> "
                    f"{resolved.canonical_name}"
                )
            else:
                print(
                    f"{raw_skill:<25} -> NOT FOUND"
                )

    finally:
        db.close()


if __name__ == "__main__":
    main()
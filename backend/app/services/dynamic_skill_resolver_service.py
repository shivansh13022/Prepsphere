from rapidfuzz import fuzz, process
from sqlalchemy import select
from sqlalchemy.orm import Session

from langchain_groq import ChatGroq

from app.core.config import settings
from app.models.skill_catalog import SkillCatalog
from app.schemas.skill_resolution import SkillResolutionDecision


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
    temperature=0,
)

structured_llm = llm.with_structured_output(
    SkillResolutionDecision
)


def get_candidate_skills(
    db: Session,
    raw_skill: str,
    limit: int = 10,
) -> list[str]:

    catalog_names = list(
        db.scalars(
            select(SkillCatalog.canonical_name)
        ).all()
    )

    matches = process.extract(
        raw_skill,
        catalog_names,
        scorer=fuzz.WRatio,
        limit=limit,
    )

    return [
        match[0]
        for match in matches
    ]


def resolve_unknown_skill(
    db: Session,
    raw_skill: str,
) -> SkillResolutionDecision:

    candidates = get_candidate_skills(
        db=db,
        raw_skill=raw_skill,
    )

    candidate_text = "\n".join(
        f"- {candidate}"
        for candidate in candidates
    )

    prompt = f"""
You are a technical skill normalization system.

An unknown skill was extracted from a resume or job description.

Unknown skill:
{raw_skill}

Possible existing skills from our catalog:
{candidate_text}

Determine whether the unknown skill is:

1. A naming variant, abbreviation, or alias of ONE existing
   catalog skill.

OR

2. A genuinely different technical skill that should remain
   a separate canonical skill.

Rules:
- Do not treat merely related technologies as equivalent.
- Java is not Spring Boot.
- Docker is not Kubernetes.
- Flask is not FastAPI.
- LangChain is not LangGraph.
- PostgreSQL is not MongoDB.
- Only return an existing skill if they represent the same
  underlying technology.
- If none of the candidates are equivalent, choose new_skill.
- If choosing existing_skill, canonical_name MUST exactly match
  one of the supplied catalog candidates.
- If choosing new_skill, preserve a clean professional name for
  the new technology.
"""

    return structured_llm.invoke(prompt)
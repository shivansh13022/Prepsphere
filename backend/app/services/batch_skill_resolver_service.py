from rapidfuzz import fuzz, process
from sqlalchemy import select
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq

from app.core.config import settings
from app.models.skill_catalog import SkillCatalog
from app.schemas.skill_resolution import (
    BatchSkillResolutionResponse,
    SkillResolutionDecision,
)
from app.services.skill_cache_service import (
    cache_existing_skill_alias,
    cache_new_skill,
)
from app.services.skill_resolver_service import resolve_skill


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
    temperature=0,
)

structured_llm = llm.with_structured_output(
    BatchSkillResolutionResponse
)


def batch_resolve_skills(
    db: Session,
    raw_skills: list[str],
) -> list[SkillResolutionDecision]:

    results: list[SkillResolutionDecision] = []
    unknown_skills: list[str] = []

    # --------------------------------------------------
    # STEP 1: resolve everything possible locally
    # --------------------------------------------------

    for raw_skill in raw_skills:
        skill = resolve_skill(
            db=db,
            skill_name=raw_skill,
        )

        if skill:
            results.append(
                SkillResolutionDecision(
                    raw_skill=raw_skill,
                    resolution_type="existing_skill",
                    canonical_name=skill.canonical_name,
                    reasoning="Resolved from local skill catalog or alias.",
                )
            )
        else:
            unknown_skills.append(raw_skill)

    # No LLM call needed if everything was resolved locally
    if not unknown_skills:
        return results

    # --------------------------------------------------
    # STEP 2: load catalog once
    # --------------------------------------------------

    catalog_names = list(
        db.scalars(
            select(SkillCatalog.canonical_name)
        ).all()
    )

    # --------------------------------------------------
    # STEP 3: build candidate list for each unknown skill
    # --------------------------------------------------

    candidate_map: dict[str, list[str]] = {}

    for raw_skill in unknown_skills:
        matches = process.extract(
            raw_skill,
            catalog_names,
            scorer=fuzz.WRatio,
            limit=10,
        )

        candidate_map[raw_skill] = [
            match[0]
            for match in matches
        ]

    candidate_sections = []

    for raw_skill, candidates in candidate_map.items():
        candidate_text = "\n".join(
            f"  - {candidate}"
            for candidate in candidates
        )

        candidate_sections.append(
            f"""
Unknown skill: {raw_skill}

Possible catalog candidates:

{candidate_text}
"""
        )

    all_candidates_text = "\n".join(candidate_sections)

    # --------------------------------------------------
    # STEP 4: ask LLM once for all unknown skills
    # --------------------------------------------------

    prompt = f"""
You are a technical skill normalization system.

Resolve every unknown technical skill below.

For each unknown skill, determine whether it is:

1. existing_skill

   A naming variation, abbreviation, spelling variation,
   or alias of ONE supplied catalog candidate.

OR

2. new_skill

   A genuinely different technical skill that should
   remain its own canonical skill.

Rules:

- Return exactly one resolution for every unknown skill.
- Preserve the exact raw_skill value provided.
- Do not treat related technologies as equivalent.
- Java is not Spring Boot.
- Docker is not Kubernetes.
- Flask is not FastAPI.
- LangChain is not LangGraph.
- PostgreSQL is not MongoDB.
- React is not React Native.

If resolution_type is existing_skill:

- canonical_name MUST exactly match one of that skill's
  supplied catalog candidates.

If resolution_type is new_skill:

- use a clean professional canonical name.
- do not force it into an unrelated existing technology.

Skills to resolve:

{all_candidates_text}
"""

    try:
        llm_result = structured_llm.invoke(prompt)

    except Exception as exc:
        # LLM may fail because of quota, timeout,
        # network/provider issues, etc.
        print(
            "Skill resolver LLM unavailable. "
            f"Falling back to raw skills. Error: {exc}"
        )

        for raw_skill in unknown_skills:
            results.append(
                SkillResolutionDecision(
                    raw_skill=raw_skill,
                    resolution_type="new_skill",
                    canonical_name=raw_skill.strip(),
                    reasoning=(
                        "LLM resolution unavailable; "
                        "using raw skill as fallback."
                    ),
                )
            )

        # IMPORTANT:
        # Even fallback new skills must be inserted
        # into SkillCatalog.
        try:
            for result in results:
                if result.resolution_type == "new_skill":
                    cache_new_skill(
                        db=db,
                        canonical_name=result.canonical_name,
                    )

            db.commit()

        except Exception:
            db.rollback()
            raise

        return results

    # --------------------------------------------------
    # STEP 5: validate LLM decisions
    # --------------------------------------------------

    for decision in llm_result.resolutions:
        raw_skill = decision.raw_skill

        if raw_skill not in candidate_map:
            continue

        if decision.resolution_type == "existing_skill":
            allowed_candidates = candidate_map[raw_skill]

            if decision.canonical_name not in allowed_candidates:
                decision = SkillResolutionDecision(
                    raw_skill=raw_skill,
                    resolution_type="new_skill",
                    canonical_name=raw_skill.strip(),
                    reasoning=(
                        "LLM returned an existing skill that "
                        "was not among the allowed catalog candidates."
                    ),
                )

        results.append(decision)

    # --------------------------------------------------
    # STEP 6: make sure every unknown got a result
    # --------------------------------------------------

    resolved_raw_skills = {
        result.raw_skill
        for result in results
    }

    for raw_skill in unknown_skills:
        if raw_skill not in resolved_raw_skills:
            results.append(
                SkillResolutionDecision(
                    raw_skill=raw_skill,
                    resolution_type="new_skill",
                    canonical_name=raw_skill.strip(),
                    reasoning=(
                        "No valid LLM resolution returned; "
                        "using raw skill as fallback."
                    ),
                )
            )

    # --------------------------------------------------
    # STEP 7: cache validated aliases and new skills
    # --------------------------------------------------

    try:
        for result in results:

            # Already resolved locally - nothing to cache
            if (
                result.reasoning
                == "Resolved from local skill catalog or alias."
            ):
                continue

            if result.resolution_type == "existing_skill":
                cache_existing_skill_alias(
                    db=db,
                    raw_skill=result.raw_skill,
                    canonical_name=result.canonical_name,
                )

            elif result.resolution_type == "new_skill":
                cache_new_skill(
                    db=db,
                    canonical_name=result.canonical_name,
                )

        db.commit()

    except Exception:
        db.rollback()
        raise

    return results
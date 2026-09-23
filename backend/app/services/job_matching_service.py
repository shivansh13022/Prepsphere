from app.schemas.job_match import JobMatchResult


def normalize_skill(skill: str) -> str:
    return skill.strip().lower()


def get_relevance_label(score: float) -> str:
    if score >= 80:
        return "Strong Match"

    if score >= 60:
        return "Good Match"

    if score >= 40:
        return "Partial Match"

    return "Stretch Role"


def calculate_job_match(
    candidate_skills: list[str],
    required_skills: list[str],
    preferred_skills: list[str],
) -> JobMatchResult:

    candidate_map = {
        normalize_skill(skill): skill
        for skill in candidate_skills
    }

    required_map = {
        normalize_skill(skill): skill
        for skill in required_skills
    }

    preferred_map = {
        normalize_skill(skill): skill
        for skill in preferred_skills
    }

    matched_required = [
        original_skill
        for normalized_skill, original_skill in required_map.items()
        if normalized_skill in candidate_map
    ]

    missing_required = [
        original_skill
        for normalized_skill, original_skill in required_map.items()
        if normalized_skill not in candidate_map
    ]

    matched_preferred = [
        original_skill
        for normalized_skill, original_skill in preferred_map.items()
        if normalized_skill in candidate_map
    ]

    missing_preferred = [
        original_skill
        for normalized_skill, original_skill in preferred_map.items()
        if normalized_skill not in candidate_map
    ]

    if required_skills:
        match_score = (
            len(matched_required) / len(required_skills)
        ) * 100
    else:
        match_score = 100.0

    match_score = round(match_score, 2)

    relevance = get_relevance_label(match_score)

    return JobMatchResult(
        match_score=match_score,
        relevance=relevance,
        matched_required_skills=matched_required,
        missing_required_skills=missing_required,
        matched_preferred_skills=matched_preferred,
        missing_preferred_skills=missing_preferred,
        candidate_skills=candidate_skills,
        job_required_skills=required_skills,
    )
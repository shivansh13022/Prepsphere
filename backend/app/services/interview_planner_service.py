from app.schemas.interview_plan import InterviewPlan
from app.schemas.job_match import JobMatchResult


def create_job_interview_plan(
    target_role: str,
    difficulty: str,
    match_result: JobMatchResult,
) -> InterviewPlan:

    return InterviewPlan(
        interview_type="job_specific",
        target_role=target_role,
        difficulty=difficulty,
        core_topics=match_result.matched_required_skills,
        gap_topics=match_result.missing_required_skills,
    )


def create_general_interview_plan(
    focus: str,
    difficulty: str,
) -> InterviewPlan:

    topics = [
        topic.strip()
        for topic in focus.split(",")
        if topic.strip()
    ]

    return InterviewPlan(
        interview_type="general",
        target_role=None,
        difficulty=difficulty,
        core_topics=topics,
        gap_topics=[],
    )
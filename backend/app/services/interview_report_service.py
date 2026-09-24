import json

from langchain_groq import ChatGroq

from app.core.config import settings
from app.schemas.interview_report import (
    InterviewReport,
    InterviewReportSummary,
)


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
)

structured_report_llm = llm.with_structured_output(
    InterviewReportSummary
)


def calculate_average_scores(
    history: list[dict],
) -> dict:
    total_answers = len(history)

    if total_answers == 0:
        return {
            "overall_score": 0.0,
            "technical_knowledge": 0.0,
            "completeness": 0.0,
            "depth": 0.0,
            "communication": 0.0,
        }

    total_score = 0
    total_correctness = 0
    total_completeness = 0
    total_depth = 0
    total_communication = 0

    for turn in history:
        evaluation = turn["evaluation"]

        total_score += evaluation["score"]
        total_correctness += evaluation["correctness"]
        total_completeness += evaluation["completeness"]
        total_depth += evaluation["depth"]
        total_communication += evaluation["communication"]

    return {
        "overall_score": round(
            total_score / total_answers,
            1,
        ),
        "technical_knowledge": round(
            total_correctness / total_answers,
            1,
        ),
        "completeness": round(
            total_completeness / total_answers,
            1,
        ),
        "depth": round(
            total_depth / total_answers,
            1,
        ),
        "communication": round(
            total_communication / total_answers,
            1,
        ),
    }


def calculate_topic_performance(
    history: list[dict],
) -> list[dict]:
    topics: dict[str, list[dict]] = {}

    # Group evaluations by topic
    for turn in history:
        topic = turn["topic"]
        evaluation = turn["evaluation"]

        if topic not in topics:
            topics[topic] = []

        topics[topic].append(evaluation)

    topic_performance = []

    # Calculate averages separately for each topic
    for topic, evaluations in topics.items():
        total = len(evaluations)

        topic_performance.append(
            {
                "topic": topic,
                "overall_score": round(
                    sum(
                        item["score"]
                        for item in evaluations
                    )
                    / total,
                    1,
                ),
                "technical_knowledge": round(
                    sum(
                        item["correctness"]
                        for item in evaluations
                    )
                    / total,
                    1,
                ),
                "completeness": round(
                    sum(
                        item["completeness"]
                        for item in evaluations
                    )
                    / total,
                    1,
                ),
                "depth": round(
                    sum(
                        item["depth"]
                        for item in evaluations
                    )
                    / total,
                    1,
                ),
                "communication": round(
                    sum(
                        item["communication"]
                        for item in evaluations
                    )
                    / total,
                    1,
                ),
                "questions_answered": total,
            }
        )

    return topic_performance


def generate_interview_report(
    history: list[dict],
) -> InterviewReport:
    scores = calculate_average_scores(history)

    topic_performance = calculate_topic_performance(
        history
    )

    history_text = json.dumps(
        history,
        indent=2,
    )

    prompt = f"""
You are generating the final report for a technical mock interview.

Analyze the complete interview history below.

INTERVIEW HISTORY:

{history_text}

Based only on the interview evidence:

1. Identify the candidate's main strengths.
2. Identify recurring weaknesses.
3. Identify technical topics that need improvement.
4. Write a concise overall interview summary.
5. Give specific actionable recommendations.

Do not generate numerical scores.

Do not invent skills or performance that are not demonstrated
in the interview history.
"""

    summary = structured_report_llm.invoke(
        prompt
    )

    return InterviewReport(
        overall_score=scores[
            "overall_score"
        ],
        technical_knowledge=scores[
            "technical_knowledge"
        ],
        completeness=scores[
            "completeness"
        ],
        depth=scores[
            "depth"
        ],
        communication=scores[
            "communication"
        ],

        topic_performance=topic_performance,

        strengths=summary.strengths,
        weaknesses=summary.weaknesses,
        topics_to_improve=summary.topics_to_improve,
        summary=summary.summary,
        recommendations=summary.recommendations,
    )
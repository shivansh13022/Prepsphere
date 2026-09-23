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


def calculate_average_scores(history: list[dict]) -> dict:
    total_answers = len(history)

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
        "overall_score": round(total_score / total_answers, 1),
        "technical_knowledge": round(
            total_correctness / total_answers, 1
        ),
        "completeness": round(
            total_completeness / total_answers, 1
        ),
        "depth": round(
            total_depth / total_answers, 1
        ),
        "communication": round(
            total_communication / total_answers, 1
        ),
    }


def generate_interview_report(
    history: list[dict],
) -> InterviewReport:

    scores = calculate_average_scores(history)

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

    summary = structured_report_llm.invoke(prompt)

    return InterviewReport(
        overall_score=scores["overall_score"],
        technical_knowledge=scores["technical_knowledge"],
        completeness=scores["completeness"],
        depth=scores["depth"],
        communication=scores["communication"],

        strengths=summary.strengths,
        weaknesses=summary.weaknesses,
        topics_to_improve=summary.topics_to_improve,
        summary=summary.summary,
        recommendations=summary.recommendations,
    )
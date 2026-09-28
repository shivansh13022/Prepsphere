from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.interview_report import InterviewReportModel
from app.models.interview_session import InterviewSession
from app.schemas.interview_analytics import (
    InterviewAnalytics,
    InterviewTrendPoint,
    OverallPerformance,
    TopicAnalytics,
)


def _round_score(value: float) -> float:
    return round(value, 2)


def _calculate_trend(
    latest_score: float,
    previous_score: float | None,
) -> str:
    if previous_score is None:
        return "insufficient_data"

    change = latest_score - previous_score

    if change >= 0.5:
        return "improving"

    if change <= -0.5:
        return "declining"

    return "stable"


def _calculate_priority(latest_score: float) -> str:
    if latest_score < 5:
        return "high"

    if latest_score < 7:
        return "medium"

    return "low"


def get_interview_analytics(
    db: Session,
    user_id: int,
) -> InterviewAnalytics:

    statement = (
        select(
            InterviewSession,
            InterviewReportModel,
        )
        .join(
            InterviewReportModel,
            InterviewReportModel.interview_id
            == InterviewSession.id,
        )
        .where(
            InterviewSession.user_id == user_id,
            InterviewSession.status == "completed",
        )
        .order_by(InterviewSession.completed_at.asc())
    )

    rows = db.execute(statement).all()

    if not rows:
        return InterviewAnalytics(
            total_interviews=0,
            overall=None,
            interview_trend=[],
            topic_performance=[],
        )

    reports = [report for _, report in rows]
    total_interviews = len(reports)

    # ---------------------------------------------------------
    # Overall performance across all completed interviews
    # ---------------------------------------------------------

    overall = OverallPerformance(
        average_score=_round_score(
            sum(report.overall_score for report in reports)
            / total_interviews
        ),
        latest_score=_round_score(
            reports[-1].overall_score
        ),
        technical_knowledge=_round_score(
            sum(
                report.technical_knowledge
                for report in reports
            )
            / total_interviews
        ),
        completeness=_round_score(
            sum(
                report.completeness
                for report in reports
            )
            / total_interviews
        ),
        depth=_round_score(
            sum(
                report.depth
                for report in reports
            )
            / total_interviews
        ),
        communication=_round_score(
            sum(
                report.communication
                for report in reports
            )
            / total_interviews
        ),
    )

    # ---------------------------------------------------------
    # Interview-by-interview trend
    # ---------------------------------------------------------

    interview_trend = []

    for session, report in rows:
        if session.completed_at is None:
            continue

        interview_trend.append(
            InterviewTrendPoint(
                interview_id=session.id,
                score=_round_score(
                    report.overall_score
                ),
                completed_at=session.completed_at,
            )
        )

    # ---------------------------------------------------------
    # Collect topic performance chronologically
    # ---------------------------------------------------------

    topic_data = defaultdict(list)

    for session, report in rows:
        for topic_result in report.topic_performance or []:

            topic = topic_result.get("topic")

            if not topic:
                continue

            topic_data[topic].append(
                {
                    "interview_id": session.id,
                    "completed_at": session.completed_at,
                    "overall_score": topic_result.get(
                        "overall_score", 0
                    ),
                    "technical_knowledge": topic_result.get(
                        "technical_knowledge", 0
                    ),
                    "completeness": topic_result.get(
                        "completeness", 0
                    ),
                    "depth": topic_result.get(
                        "depth", 0
                    ),
                    "communication": topic_result.get(
                        "communication", 0
                    ),
                }
            )

    # ---------------------------------------------------------
    # Aggregate topics + calculate trend intelligence
    # ---------------------------------------------------------

    topic_performance = []

    for topic, entries in topic_data.items():

        count = len(entries)

        latest_entry = entries[-1]

        latest_score = _round_score(
            latest_entry["overall_score"]
        )

        previous_score = None

        if count >= 2:
            previous_score = _round_score(
                entries[-2]["overall_score"]
            )

        change = None

        if previous_score is not None:
            change = _round_score(
                latest_score - previous_score
            )

        trend = _calculate_trend(
            latest_score,
            previous_score,
        )

        priority = _calculate_priority(
            latest_score
        )

        topic_performance.append(
            TopicAnalytics(
                topic=topic,

                average_score=_round_score(
                    sum(
                        entry["overall_score"]
                        for entry in entries
                    )
                    / count
                ),

                latest_score=latest_score,
                previous_score=previous_score,
                change=change,
                trend=trend,
                priority=priority,

                interviews=count,

                technical_knowledge=_round_score(
                    sum(
                        entry["technical_knowledge"]
                        for entry in entries
                    )
                    / count
                ),

                completeness=_round_score(
                    sum(
                        entry["completeness"]
                        for entry in entries
                    )
                    / count
                ),

                depth=_round_score(
                    sum(
                        entry["depth"]
                        for entry in entries
                    )
                    / count
                ),

                communication=_round_score(
                    sum(
                        entry["communication"]
                        for entry in entries
                    )
                    / count
                ),
            )
        )

    # Weakest current topics first.
    topic_performance.sort(
        key=lambda item: item.latest_score
    )

    return InterviewAnalytics(
        total_interviews=total_interviews,
        overall=overall,
        interview_trend=interview_trend,
        topic_performance=topic_performance,
    )
import json
from datetime import datetime,timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db

from app.models.interview_session import InterviewSession
from app.models.interview_report import InterviewReportModel
from app.models.job import Job
from app.models.job_analysis import JobAnalysis
from app.models.skill import Skill
from app.models.skill_catalog import SkillCatalog
from app.models.user import User

from app.schemas.interview import (
    InterviewSessionCreate,
    InterviewSessionResponse,
    InterviewStartResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
)
from app.schemas.interview_plan import InterviewPlan
from app.schemas.interview_report import InterviewReport

from app.interview_graph.graph import interview_graph

from app.services.interview_planner_service import (
    create_general_interview_plan,
    create_job_interview_plan,
)
from app.services.job_matching_service import calculate_job_match
from app.services.interview_report_service import generate_interview_report


router = APIRouter()

def finalize_interview(
    interview: InterviewSession,
    history: list[dict],
    db: Session,
):
    # Don't create the same report twice.
    existing_report = db.scalar(
        select(InterviewReportModel).where(
            InterviewReportModel.interview_id == interview.id
        )
    )

    if existing_report:
        return existing_report

    # We cannot evaluate performance if nothing was answered.
    if not history:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete at least one answer before ending the interview.",
        )

    # Generate report from completed interview history.
    report = generate_interview_report(history)

    report_model = InterviewReportModel(
        interview_id=interview.id,

        overall_score=report.overall_score,
        technical_knowledge=report.technical_knowledge,
        completeness=report.completeness,
        depth=report.depth,
        communication=report.communication,

        strengths=report.strengths,
        weaknesses=report.weaknesses,
        topics_to_improve=report.topics_to_improve,
        recommendations=report.recommendations,

        summary=report.summary,
    )

    interview.status = "completed"
    interview.completed_at = datetime.now(timezone.utc)

    db.add(report_model)
    db.commit()
    db.refresh(report_model)

    return report_model


# =========================================================
# CREATE INTERVIEW SESSION
# =========================================================

@router.post(
    "/interviews",
    response_model=InterviewSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_interview_session(
    interview_data: InterviewSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # If a job was selected, verify that it belongs to this user.
    if interview_data.job_id is not None:
        job = db.scalar(
            select(Job).where(
                Job.id == interview_data.job_id,
                Job.user_id == current_user.id,
            )
        )

        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )

    # A general interview needs a focus.
    if (
        interview_data.job_id is None
        and not interview_data.focus
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either a job_id or an interview focus.",
        )

    interview = InterviewSession(
      user_id=current_user.id,
      job_id=interview_data.job_id,
      focus=interview_data.focus,
      difficulty=interview_data.difficulty,
      duration_minutes=interview_data.duration_minutes,
      status="pending",
    )

    try:
        db.add(interview)
        db.commit()
        db.refresh(interview)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create interview session.",
        )

    return interview


# =========================================================
# BUILD INTERVIEW PLAN
# =========================================================

def build_interview_plan(
    interview: InterviewSession,
    current_user: User,
    db: Session,
) -> InterviewPlan:

    # -----------------------------------------------------
    # GENERAL INTERVIEW
    # -----------------------------------------------------

    if interview.job_id is None:
        return create_general_interview_plan(
            focus=interview.focus,
            difficulty=interview.difficulty,
        )

    # -----------------------------------------------------
    # JOB-SPECIFIC INTERVIEW
    # -----------------------------------------------------

    job = db.scalar(
        select(Job).where(
            Job.id == interview.job_id,
            Job.user_id == current_user.id,
        )
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # -----------------------------------------------------
    # LOAD JOB ANALYSIS
    # -----------------------------------------------------

    job_analysis = db.scalar(
        select(JobAnalysis).where(
            JobAnalysis.job_id == job.id
        )
    )

    if not job_analysis:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Job must be analyzed before interview planning.",
        )

    # -----------------------------------------------------
    # LOAD CANDIDATE CANONICAL SKILLS
    # -----------------------------------------------------

    candidate_skills = sorted(
        set(
            db.scalars(
                select(SkillCatalog.canonical_name)
                .join(
                    Skill,
                    Skill.skill_catalog_id == SkillCatalog.id,
                )
                .where(
                    Skill.user_id == current_user.id,
                    Skill.skill_catalog_id.is_not(None),
                )
            ).all()
        )
    )

    # -----------------------------------------------------
    # LOAD CANONICAL JD SKILLS
    # -----------------------------------------------------

    required_skills = json.loads(
        job_analysis.canonical_required_skills or "[]"
    )

    preferred_skills = json.loads(
        job_analysis.canonical_preferred_skills or "[]"
    )

    # -----------------------------------------------------
    # CALCULATE JOB MATCH
    # -----------------------------------------------------

    match_result = calculate_job_match(
        candidate_skills=candidate_skills,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
    )

    # -----------------------------------------------------
    # CREATE INTERVIEW PLAN
    # -----------------------------------------------------

    return create_job_interview_plan(
        target_role=job.title,
        difficulty=interview.difficulty,
        match_result=match_result,
    )


# =========================================================
# CREATE / VIEW INTERVIEW PLAN
# =========================================================

@router.post(
    "/interviews/{interview_id}/plan",
    response_model=InterviewPlan,
)
def create_interview_plan(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = db.scalar(
        select(InterviewSession).where(
            InterviewSession.id == interview_id,
            InterviewSession.user_id == current_user.id,
        )
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )

    return build_interview_plan(
        interview=interview,
        current_user=current_user,
        db=db,
    )


# =========================================================
# START INTERVIEW
# =========================================================

@router.post(
    "/interviews/{interview_id}/start",
    response_model=InterviewStartResponse,
)
def start_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = db.scalar(
        select(InterviewSession).where(
            InterviewSession.id == interview_id,
            InterviewSession.user_id == current_user.id,
        )
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )

    # Build interview plan.
    plan = build_interview_plan(
        interview=interview,
        current_user=current_user,
        db=db,
    )
    started_at = datetime.now(timezone.utc)

    # Convert InterviewPlan -> LangGraph state.
    initial_state = {
        "interview_id": interview.id,
        "difficulty": interview.difficulty,

        "core_topics": plan.core_topics,
        "gap_topics": plan.gap_topics,

        "current_topic": None,
        "current_question": None,
        "candidate_answer": None,

        "questions_asked": 0,

        # TEMPORARILY 2 FOR TESTING.
        # Change back to 10 after the report flow is verified.
        "max_questions": 30,

        "consecutive_follow_ups": 0,

        "history": [],

        "evaluation": None,
        "end_requested": False,

        "started_at": started_at.isoformat(),
        "duration_minutes": interview.duration_minutes,
    }

    # LangGraph conversation ID.
    config = {
        "configurable": {
            "thread_id": str(interview.id)
        }
    }

    # Start graph -> generate first question -> pause.
    result = interview_graph.invoke(
        initial_state,
        config=config,
    )

    # Update database status.
    interview.status = "in_progress"
    interview.started_at= started_at
    db.commit()

    # Send Question 1 back to frontend.
    return InterviewStartResponse(
        interview_id=interview.id,
        status="in_progress",
        current_topic=result["current_topic"],
        question=result["current_question"],
        questions_asked=result["questions_asked"],
    )


# =========================================================
# ANSWER INTERVIEW QUESTION
# =========================================================

@router.post(
    "/interviews/{interview_id}/answer",
    response_model=InterviewAnswerResponse,
)
def answer_interview_question(
    interview_id: int,
    answer_data: InterviewAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Make sure this interview belongs to the current user.
    interview = db.scalar(
        select(InterviewSession).where(
            InterviewSession.id == interview_id,
            InterviewSession.user_id == current_user.id,
        )
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )

    if interview.status != "in_progress":
     raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Interview is not currently in progress.",
     )

    # Same LangGraph thread created by /start.
    config = {
        "configurable": {
            "thread_id": str(interview.id)
        }
    }

    # Put candidate's answer into the paused graph state.
    interview_graph.update_state(
        config,
        {
            "candidate_answer": answer_data.answer
        },
    )

    # Resume graph:
    # evaluate answer -> route -> generate next question -> pause/end.
    result = interview_graph.invoke(
        None,
        config=config,
    )

    # Check whether LangGraph has finished.
    checkpoint = interview_graph.get_state(config)

    # -----------------------------------------------------
    # INTERVIEW FINISHED
    # -----------------------------------------------------

    if not checkpoint.next:
     history = result["history"]

     finalize_interview(
        interview=interview,
        history=history,
        db=db,
     )

     return InterviewAnswerResponse(
        interview_id=interview.id,
        status="completed",
        current_topic=result.get("current_topic"),
        question=None,
        questions_asked=result["questions_asked"],
     )

    # -----------------------------------------------------
    # INTERVIEW STILL RUNNING
    # -----------------------------------------------------

    return InterviewAnswerResponse(
        interview_id=interview.id,
        status="in_progress",
        current_topic=result["current_topic"],
        question=result["current_question"],
        questions_asked=result["questions_asked"],
    )


# =========================================================
# GET FINAL INTERVIEW REPORT
# =========================================================

@router.get(
    "/interviews/{interview_id}/report",
    response_model=InterviewReport,
)
def get_interview_report(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify interview belongs to current user.
    interview = db.scalar(
        select(InterviewSession).where(
            InterviewSession.id == interview_id,
            InterviewSession.user_id == current_user.id,
        )
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )

    # Load already-generated report from PostgreSQL.
    report = db.scalar(
        select(InterviewReportModel).where(
            InterviewReportModel.interview_id == interview.id
        )
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview report not found",
        )

    return report

# =========================================================
# MANUALLY END INTERVIEW
# =========================================================

@router.post(
    "/interviews/{interview_id}/end",
    response_model=InterviewAnswerResponse,
)
def end_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = db.scalar(
        select(InterviewSession).where(
            InterviewSession.id == interview_id,
            InterviewSession.user_id == current_user.id,
        )
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )

    if interview.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interview is already completed.",
        )

    if interview.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interview is not currently in progress.",
        )

    config = {
        "configurable": {
            "thread_id": str(interview.id)
        }
    }

    checkpoint = interview_graph.get_state(config)

    if not checkpoint.values:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interview state is unavailable.",
        )

    history = checkpoint.values.get("history", [])

    finalize_interview(
        interview=interview,
        history=history,
        db=db,
    )

    return InterviewAnswerResponse(
        interview_id=interview.id,
        status="completed",
        current_topic=checkpoint.values.get("current_topic"),
        question=None,
        questions_asked=checkpoint.values.get(
            "questions_asked",
            0,
        ),
    )

# =========================================================
# GET INTERVIEW HISTORY
# =========================================================

@router.get(
    "/interviews",
    response_model=list[InterviewSessionResponse],
)
def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interviews = db.scalars(
        select(InterviewSession)
        .where(
            InterviewSession.user_id == current_user.id
        )
        .order_by(InterviewSession.id.desc())
    ).all()

    return interviews
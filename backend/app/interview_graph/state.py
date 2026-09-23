from typing import TypedDict


class InterviewState(TypedDict):
    interview_id: int

    difficulty: str

    core_topics: list[str]
    gap_topics: list[str]

    current_topic: str | None
    current_question: str | None
    candidate_answer: str | None

    questions_asked: int
    max_questions: int

    consecutive_follow_ups: int

    history: list[dict]

    evaluation: dict | None

    end_requested: bool

    started_at: str
    duration_minutes: int
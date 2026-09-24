from typing import TypedDict


class InterviewState(TypedDict):
    interview_id: int

    difficulty: str

    core_topics: list[str]
    gap_topics: list[str]

    # Concepts generated once when the interview starts.
    #
    # Example:
    # {
    #     "Agentic AI": [
    #         "fundamentals",
    #         "tools",
    #         "memory",
    #     ]
    # }
    topic_concepts: dict[str, list[str]]

    current_topic: str | None

    current_concept: str | None
    current_concept_index: int

    # Number of completed answers for the current concept.
    questions_on_current_concept: int

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
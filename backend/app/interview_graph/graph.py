from datetime import datetime, timezone

from langgraph.graph import END, START, StateGraph
from langgraph.checkpoint.memory import InMemorySaver

from app.interview_graph.state import InterviewState

from app.services.interview_question_service import (
    generate_interview_question,
    generate_follow_up_question,
)

from app.services.interview_evaluation_service import (
    evaluate_interview_answer,
)


# =========================================================
# HELPERS
# =========================================================

def get_all_topics(state: InterviewState) -> list[str]:
    """
    Combine core + gap topics while preserving order
    and removing duplicates.
    """

    return list(
        dict.fromkeys(
            state["core_topics"] + state["gap_topics"]
        )
    )


def get_concepts_for_topic(
    state: InterviewState,
    topic: str,
) -> list[str]:

    concepts = state["topic_concepts"].get(
        topic,
        [],
    )

    if concepts:
        return concepts

    # Defensive fallback.
    return [
        "fundamentals",
        "practical understanding",
        "common use cases",
    ]


# =========================================================
# NODE 1: SETUP INTERVIEW
# =========================================================

def setup_interview(state: InterviewState):

    all_topics = get_all_topics(state)

    if not all_topics:
        return {
            "current_topic": None,
            "current_concept": None,
        }

    first_topic = all_topics[0]

    concepts = get_concepts_for_topic(
        state,
        first_topic,
    )

    first_concept = concepts[0]

    return {
        "current_topic": first_topic,
        "current_concept": first_concept,
        "current_concept_index": 0,
        "questions_on_current_concept": 0,
        "consecutive_follow_ups": 0,
    }


# =========================================================
# NODE 2: GENERATE NORMAL QUESTION
# =========================================================

def generate_question(state: InterviewState):

    question = generate_interview_question(
        topic=state["current_topic"],
        concept=state["current_concept"],
        difficulty=state["difficulty"],
    )

    return {
        "current_question": question,
        "candidate_answer": None,
        "evaluation": None,
        "questions_asked":
            state["questions_asked"] + 1,
    }


# =========================================================
# NODE 3: EVALUATE ANSWER
# =========================================================

def evaluate_answer(state: InterviewState):

    evaluation = evaluate_interview_answer(
        question=state["current_question"],
        candidate_answer=state["candidate_answer"],
        topic=state["current_topic"],
        concept=state["current_concept"],
        difficulty=state["difficulty"],
    )

    evaluation_dict = evaluation.model_dump()

    turn = {
        "topic": state["current_topic"],
        "concept": state["current_concept"],
        "question": state["current_question"],
        "answer": state["candidate_answer"],
        "evaluation": evaluation_dict,
    }

    history = state["history"] + [turn]

    return {
        "evaluation": evaluation_dict,
        "history": history,

        # This counts COMPLETED answers on the current concept.
        "questions_on_current_concept":
            state["questions_on_current_concept"] + 1,
    }


# =========================================================
# ROUTER: AFTER EVALUATION
# =========================================================

def route_after_evaluation(state: InterviewState):

    # -----------------------------------------------------
    # GLOBAL STOP CONDITIONS
    # -----------------------------------------------------

    if state["end_requested"]:
        return "finish"

    if interview_duration_reached(state):
        return "finish"

    if state["questions_asked"] >= state["max_questions"]:
        return "finish"

    # -----------------------------------------------------
    # DETERMINISTIC CONCEPT GUARD
    # -----------------------------------------------------

    # Never allow endless questioning on one concept.
    #
    # Once two completed answers have been collected,
    # move to another concept regardless of the LLM's
    # routing decision.
    if state["questions_on_current_concept"] >= 2:
        return "next_concept"

    # -----------------------------------------------------
    # AI EVALUATOR DECISION
    # -----------------------------------------------------

    decision = state["evaluation"]["decision"]

    if decision == "follow_up":

        # One follow-up is enough for V1.
        if state["consecutive_follow_ups"] >= 1:
            return "next_concept"

        return "follow_up"

    if decision == "same_level":
        return "same_level"

    if decision == "go_deeper":
        return "go_deeper"

    if decision == "next_concept":
        return "next_concept"

    if decision == "next_topic":
        return "next_topic"

    # Safe fallback.
    return "next_concept"


# =========================================================
# DURATION
# =========================================================

def interview_duration_reached(
    state: InterviewState,
) -> bool:

    started_at = datetime.fromisoformat(
        state["started_at"]
    )

    if started_at.tzinfo is None:
        started_at = started_at.replace(
            tzinfo=timezone.utc
        )

    now = datetime.now(timezone.utc)

    elapsed_seconds = (
        now - started_at
    ).total_seconds()

    duration_seconds = (
        state["duration_minutes"] * 60
    )

    return elapsed_seconds >= duration_seconds


# =========================================================
# NODE 4: FOLLOW-UP
# =========================================================

def generate_follow_up(state: InterviewState):

    evaluation = state["evaluation"]

    question = generate_follow_up_question(
        topic=state["current_topic"],
        concept=state["current_concept"],
        previous_question=state["current_question"],
        candidate_answer=state["candidate_answer"],
        weaknesses=evaluation["weaknesses"],
        missing_concepts=evaluation["missing_concepts"],
        difficulty=state["difficulty"],
    )

    return {
        "current_question": question,
        "candidate_answer": None,
        "evaluation": None,

        "questions_asked":
            state["questions_asked"] + 1,

        "consecutive_follow_ups":
            state["consecutive_follow_ups"] + 1,
    }


# =========================================================
# NODE 5: SAME LEVEL
# =========================================================

def generate_same_level_question(
    state: InterviewState,
):

    question = generate_interview_question(
        topic=state["current_topic"],
        concept=state["current_concept"],
        difficulty=state["difficulty"],
    )

    return {
        "current_question": question,
        "candidate_answer": None,
        "evaluation": None,

        "questions_asked":
            state["questions_asked"] + 1,

        "consecutive_follow_ups": 0,
    }


# =========================================================
# NODE 6: GO DEEPER
# =========================================================

def generate_deeper_question(
    state: InterviewState,
):

    question = generate_interview_question(
        topic=state["current_topic"],
        concept=state["current_concept"],
        difficulty=state["difficulty"],
        deeper=True,
    )

    return {
        "current_question": question,
        "candidate_answer": None,
        "evaluation": None,

        "questions_asked":
            state["questions_asked"] + 1,

        "consecutive_follow_ups": 0,
    }


# =========================================================
# NODE 7: MOVE TO NEXT CONCEPT
# =========================================================

def move_to_next_concept(
    state: InterviewState,
):

    current_topic = state["current_topic"]

    if current_topic is None:
        return {
            "current_concept": None,
        }

    concepts = get_concepts_for_topic(
        state,
        current_topic,
    )

    next_index = (
        state["current_concept_index"] + 1
    )

    # -----------------------------------------------------
    # MORE CONCEPTS EXIST IN CURRENT TOPIC
    # -----------------------------------------------------

    if next_index < len(concepts):

        return {
            "current_concept":
                concepts[next_index],

            "current_concept_index":
                next_index,

            "questions_on_current_concept": 0,

            "candidate_answer": None,
            "evaluation": None,
            "consecutive_follow_ups": 0,
        }

    # -----------------------------------------------------
    # CURRENT TOPIC HAS NO MORE CONCEPTS
    # -----------------------------------------------------

    return {
        "current_concept": None,
    }


# =========================================================
# ROUTER: AFTER CONCEPT CHANGE
# =========================================================

def route_after_concept_change(
    state: InterviewState,
):

    # Another concept exists in same topic.
    if state["current_concept"] is not None:
        return "continue_concept"

    # Concepts exhausted -> move topic.
    return "next_topic"


# =========================================================
# NODE 8: MOVE TO NEXT TOPIC
# =========================================================

def move_to_next_topic(
    state: InterviewState,
):

    all_topics = get_all_topics(state)

    current_topic = state["current_topic"]

    if current_topic not in all_topics:
        return {
            "current_topic": None,
            "current_concept": None,
        }

    current_index = all_topics.index(
        current_topic
    )

    next_topic_index = current_index + 1

    # -----------------------------------------------------
    # NO MORE TOPICS
    # -----------------------------------------------------

    if next_topic_index >= len(all_topics):

        return {
            "current_topic": None,
            "current_concept": None,
        }

    # -----------------------------------------------------
    # NEXT TOPIC
    # -----------------------------------------------------

    next_topic = all_topics[
        next_topic_index
    ]

    concepts = get_concepts_for_topic(
        state,
        next_topic,
    )

    return {
        "current_topic": next_topic,

        "current_concept": concepts[0],
        "current_concept_index": 0,

        "questions_on_current_concept": 0,

        "candidate_answer": None,
        "evaluation": None,
        "consecutive_follow_ups": 0,
    }


# =========================================================
# ROUTER: AFTER TOPIC CHANGE
# =========================================================

def route_after_topic_change(
    state: InterviewState,
):

    if state["current_topic"] is None:
        return "finish"

    return "continue"


# =========================================================
# BUILD GRAPH
# =========================================================

builder = StateGraph(InterviewState)


# =========================================================
# REGISTER NODES
# =========================================================

builder.add_node(
    "setup_interview",
    setup_interview,
)

builder.add_node(
    "generate_question",
    generate_question,
)

builder.add_node(
    "evaluate_answer",
    evaluate_answer,
)

builder.add_node(
    "generate_follow_up",
    generate_follow_up,
)

builder.add_node(
    "generate_same_level_question",
    generate_same_level_question,
)

builder.add_node(
    "generate_deeper_question",
    generate_deeper_question,
)

builder.add_node(
    "move_to_next_concept",
    move_to_next_concept,
)

builder.add_node(
    "move_to_next_topic",
    move_to_next_topic,
)


# =========================================================
# INITIAL FLOW
# =========================================================

builder.add_edge(
    START,
    "setup_interview",
)

builder.add_edge(
    "setup_interview",
    "generate_question",
)

builder.add_edge(
    "generate_question",
    "evaluate_answer",
)


# =========================================================
# ADAPTIVE ROUTING
# =========================================================

builder.add_conditional_edges(
    "evaluate_answer",
    route_after_evaluation,
    {
        "follow_up":
            "generate_follow_up",

        "same_level":
            "generate_same_level_question",

        "go_deeper":
            "generate_deeper_question",

        "next_concept":
            "move_to_next_concept",

        "next_topic":
            "move_to_next_topic",

        "finish":
            END,
    },
)


# =========================================================
# QUESTION NODES LOOP BACK TO EVALUATOR
# =========================================================

builder.add_edge(
    "generate_follow_up",
    "evaluate_answer",
)

builder.add_edge(
    "generate_same_level_question",
    "evaluate_answer",
)

builder.add_edge(
    "generate_deeper_question",
    "evaluate_answer",
)


# =========================================================
# AFTER CHANGING CONCEPT
# =========================================================

builder.add_conditional_edges(
    "move_to_next_concept",
    route_after_concept_change,
    {
        "continue_concept":
            "generate_question",

        "next_topic":
            "move_to_next_topic",
    },
)


# =========================================================
# AFTER CHANGING TOPIC
# =========================================================

builder.add_conditional_edges(
    "move_to_next_topic",
    route_after_topic_change,
    {
        "continue":
            "generate_question",

        "finish":
            END,
    },
)


# =========================================================
# CHECKPOINTING
# =========================================================

checkpointer = InMemorySaver()


# =========================================================
# COMPILE
# =========================================================

interview_graph = builder.compile(
    checkpointer=checkpointer,

    interrupt_after=[
        "generate_question",
        "generate_follow_up",
        "generate_same_level_question",
        "generate_deeper_question",
    ],
)
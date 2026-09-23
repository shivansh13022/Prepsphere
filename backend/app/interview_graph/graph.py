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

from datetime import datetime, timezone
# =========================================================
# NODE 1: SETUP INTERVIEW
# =========================================================

def setup_interview(state: InterviewState):
    first_topic = None

    if state["core_topics"]:
        first_topic = state["core_topics"][0]

    elif state["gap_topics"]:
        first_topic = state["gap_topics"][0]

    return {
        "current_topic": first_topic,
    }


# =========================================================
# NODE 2: GENERATE NORMAL QUESTION
# =========================================================

def generate_question(state: InterviewState):
    question = generate_interview_question(
        topic=state["current_topic"],
        difficulty=state["difficulty"],
    )

    return {
        "current_question": question,
        "candidate_answer": None,
        "evaluation": None,
        "questions_asked": state["questions_asked"] + 1,
    }


# =========================================================
# NODE 3: EVALUATE ANSWER
# =========================================================

def evaluate_answer(state: InterviewState):
    evaluation = evaluate_interview_answer(
    question=state["current_question"],
    candidate_answer=state["candidate_answer"],
    topic=state["current_topic"],
    difficulty=state["difficulty"],
    )

    evaluation_dict = evaluation.model_dump()

    turn = {
        "topic": state["current_topic"],
        "question": state["current_question"],
        "answer": state["candidate_answer"],
        "evaluation": evaluation_dict,
    }

    history = state["history"] + [turn]

    return {
        "evaluation": evaluation_dict,
        "history": history,
    }

# =========================================================
# ROUTER: DECIDE WHAT HAPPENS NEXT
# =========================================================

def route_after_evaluation(state: InterviewState):

    # -----------------------------------------
    # Deterministic application guardrails
    # -----------------------------------------

    if state["end_requested"]:
        return "finish"

    if interview_duration_reached(state):
        return "finish"

    if state["questions_asked"] >= state["max_questions"]:
        return "finish"

    # -----------------------------------------
    # Read AI evaluator decision
    # -----------------------------------------

    decision = state["evaluation"]["decision"]

    # Prevent endless follow-up loops
    if decision == "follow_up":

        if state["consecutive_follow_ups"] >= 2:
            return "next_topic"

        return "follow_up"

    if decision == "same_level":
        return "same_level"

    if decision == "go_deeper":
        return "go_deeper"

    if decision == "next_topic":
        return "next_topic"

    # Safety fallback
    return "finish"


def interview_duration_reached(state: InterviewState) -> bool:
    started_at = datetime.fromisoformat(state["started_at"])

    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)

    elapsed_seconds = (now - started_at).total_seconds()
    duration_seconds = state["duration_minutes"] * 60

    return elapsed_seconds >= duration_seconds


# =========================================================
# NODE 4: GENERATE FOLLOW-UP
# =========================================================

def generate_follow_up(state: InterviewState):
    evaluation = state["evaluation"]

    question = generate_follow_up_question(
        topic=state["current_topic"],
        previous_question=state["current_question"],
        candidate_answer=state["candidate_answer"],
        weaknesses=evaluation["weaknesses"],
        missing_concepts=evaluation["missing_concepts"],
    )

    return {
        "current_question": question,
        "candidate_answer": None,
        "evaluation": None,

        "questions_asked": state["questions_asked"] + 1,

        "consecutive_follow_ups":
            state["consecutive_follow_ups"] + 1,
    }


# =========================================================
# NODE 5: SAME LEVEL
# =========================================================

def generate_same_level_question(state: InterviewState):
    question = generate_interview_question(
        topic=state["current_topic"],
        difficulty=state["difficulty"],
    )

    return {
        "current_question": question,
        "candidate_answer": None,
        "evaluation": None,

        "questions_asked": state["questions_asked"] + 1,

        "consecutive_follow_ups": 0,
    }


# =========================================================
# NODE 6: GO DEEPER
# =========================================================

def generate_deeper_question(state: InterviewState):

    # For V1 we use "hard" to represent a deeper question.
    #
    # Later we can create a dedicated deeper-question prompt
    # that uses the previous answer as context.

    question = generate_interview_question(
        topic=state["current_topic"],
        difficulty="hard",
    )

    return {
        "current_question": question,
        "candidate_answer": None,
        "evaluation": None,

        "questions_asked": state["questions_asked"] + 1,

        "consecutive_follow_ups": 0,
    }


# =========================================================
# NODE 7: MOVE TO NEXT TOPIC
# =========================================================

def move_to_next_topic(state: InterviewState):

    all_topics = (
        state["core_topics"]
        + state["gap_topics"]
    )

    current_topic = state["current_topic"]

    # Find where we currently are
    if current_topic not in all_topics:
        return {
            "current_topic": None,
        }

    current_index = all_topics.index(current_topic)

    next_index = current_index + 1

    # No more topics
    if next_index >= len(all_topics):
        return {
            "current_topic": None,
        }

    return {
        "current_topic": all_topics[next_index],
        "candidate_answer": None,
        "evaluation": None,
        "consecutive_follow_ups": 0,
    }


# =========================================================
# ROUTER: AFTER MOVING TOPIC
# =========================================================

def route_after_topic_change(state: InterviewState):

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
        "follow_up": "generate_follow_up",

        "same_level":
            "generate_same_level_question",

        "go_deeper":
            "generate_deeper_question",

        "next_topic":
            "move_to_next_topic",

        "finish": END,
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
# AFTER CHANGING TOPIC
# =========================================================

builder.add_conditional_edges(
    "move_to_next_topic",
    route_after_topic_change,
    {
        "continue": "generate_question",
        "finish": END,
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
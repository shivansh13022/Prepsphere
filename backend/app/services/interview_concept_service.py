from pydantic import BaseModel, Field
from langchain_groq import ChatGroq

from app.core.config import settings


class TopicConcepts(BaseModel):
    topic: str
    concepts: list[str] = Field(
        min_length=3,
        max_length=6,
    )


class InterviewConceptPlan(BaseModel):
    topics: list[TopicConcepts]


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
    temperature=0,
)

structured_concept_llm = llm.with_structured_output(
    InterviewConceptPlan
)


def create_interview_concept_plan(
    topics: list[str],
    difficulty: str,
) -> dict[str, list[str]]:

    if not topics:
        return {}

    topics_text = "\n".join(
        f"- {topic}"
        for topic in topics
    )

    prompt = f"""
You are planning topic coverage for a technical software engineering
mock interview.

Selected difficulty:
{difficulty}

Interview topics:
{topics_text}

For EACH topic, generate 3 to 6 distinct interview concepts that together
provide useful breadth across that topic.

A concept is a sub-area of the topic that can be tested with one or more
interview questions.

Examples:

Topic: RAG
Possible concepts:
- retrieval fundamentals
- chunking
- embeddings
- vector search
- context construction

Topic: React
Possible concepts:
- components and props
- state
- hooks
- rendering
- component communication

These examples are only illustrative. Generate concepts appropriate to
the actual topics supplied above.

Difficulty guidance:

EASY:
Choose foundational concepts that a beginner should reasonably know.

MEDIUM:
Choose practical concepts, common implementation concerns, and
moderate technical depth.

HARD:
Concepts may include internals, architecture, difficult trade-offs,
advanced behavior, and edge cases.

Rules:
- Preserve the original topic names exactly.
- Generate concepts for every supplied topic.
- Concepts within a topic must be meaningfully different.
- Do not generate interview questions.
- Do not generate answers.
- Avoid duplicate concepts.
- Do not introduce unrelated topics.
"""

    result = structured_concept_llm.invoke(prompt)

    generated = {
        item.topic: item.concepts
        for item in result.topics
    }

    # Make sure every original topic has something usable even if
    # the LLM unexpectedly omits one.
    concept_plan: dict[str, list[str]] = {}

    for topic in topics:
        concepts = generated.get(topic)

        if concepts:
            concept_plan[topic] = concepts
        else:
            concept_plan[topic] = [
                "fundamentals",
                "practical understanding",
                "common use cases",
            ]

    return concept_plan
from langchain_groq import ChatGroq
from app.core.config import settings

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
)

def generate_interview_question(
    topic: str,
    difficulty: str,
) -> str:

    prompt = f"""
You are conducting a technical software engineering interview.

Generate exactly one interview question.

Topic: {topic}
Difficulty: {difficulty}

Rules:
- Ask only one question.
- The question must be relevant to the given topic.
- Match the requested difficulty.
- Do not provide the answer.
- Do not provide hints.
- Do not add introductory text.
"""

    response = llm.invoke(prompt)

    content = response.content

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                return block.get("text", "")

    return str(content)


def generate_follow_up_question(
    topic: str,
    previous_question: str,
    candidate_answer: str,
    weaknesses: list[str],
    missing_concepts: list[str],
) -> str:

    prompt = f"""
You are conducting a technical software engineering interview.

Topic:
{topic}

Previous question:
{previous_question}

Candidate answer:
{candidate_answer}

Weaknesses identified:
{weaknesses}

Missing concepts:
{missing_concepts}

Generate exactly one follow-up interview question.

Rules:
- The follow-up must directly address an important weakness or missing concept.
- Do not provide the answer.
- Do not provide hints.
- Ask only one question.
- Do not add introductory text.
"""

    response = llm.invoke(prompt)

    content = response.content

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                return block.get("text", "")

    return str(content)
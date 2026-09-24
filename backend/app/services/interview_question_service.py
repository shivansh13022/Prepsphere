from langchain_groq import ChatGroq

from app.core.config import settings


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
)


def generate_interview_question(
    topic: str,
    concept:str,
    difficulty: str,
    deeper: bool = False,
) -> str:

    difficulty = difficulty.lower()

    difficulty_guidance = {
        "easy": """
The candidate selected EASY difficulty.

Ask a genuinely beginner/foundational interview question.

The question should focus on:
- basic definitions
- fundamental concepts
- simple differences between common concepts
- basic use cases
- simple practical understanding

Avoid:
- obscure implementation details
- advanced architecture
- difficult edge cases
- research-level concepts
- complex system design
- deep framework internals

A candidate with introductory knowledge of the topic should
reasonably be able to answer the question.
""",

        "medium": """
The candidate selected MEDIUM difficulty.

Ask an intermediate practical interview question.

The question may involve:
- applying the concept
- practical scenarios
- common trade-offs
- debugging or implementation choices
- explaining why something is used

Avoid highly obscure internals or research-level details.
""",

        "hard": """
The candidate selected HARD difficulty.

Ask an advanced technical interview question.

The question may involve:
- internals
- architecture
- difficult trade-offs
- edge cases
- advanced implementation decisions
- deeper system behavior
""",
    }

    guidance = difficulty_guidance.get(
        difficulty,
        difficulty_guidance["medium"],
    )

    deeper_instruction = ""

    if deeper:
        deeper_instruction = """
The candidate performed strongly on the previous question.

Ask a somewhat deeper question than a normal question at this
difficulty, but DO NOT exceed the selected difficulty category.

For example:
- EASY may become a slightly more applied EASY question.
- MEDIUM may become a more challenging MEDIUM question.
- HARD may explore advanced details.

Do not automatically turn the question into HARD difficulty.
"""

    prompt = f"""
You are conducting a realistic technical software engineering interview.

Topic:
{topic}

Concept being tested:
{concept}

Selected difficulty:
{difficulty}

DIFFICULTY GUIDANCE:

{guidance}

{deeper_instruction}

Generate exactly one interview question.

Rules:
- Ask only one question.
- The question must be relevant to the given topic.
- Strictly respect the selected difficulty.
- Use clear and direct wording.
- Do not provide the answer.
- Do not provide hints.
- Do not add introductory text.
"""

    response = llm.invoke(prompt)

    return extract_text(response.content)


def generate_follow_up_question(
    topic: str,
    concept: str,
    previous_question: str,
    candidate_answer: str,
    weaknesses: list[str],
    missing_concepts: list[str],
    difficulty: str,
) -> str:

    prompt = f"""
You are conducting a realistic technical software engineering interview.

Topic:
{topic}
Current concept:
{concept}
Selected difficulty:
{difficulty}

Previous question:
{previous_question}

Candidate answer:
{candidate_answer}

Weaknesses identified:
{weaknesses}

Missing concepts:
{missing_concepts}

Generate exactly one useful follow-up interview question.

The purpose of the follow-up is to give the candidate ONE reasonable
opportunity to clarify or demonstrate understanding.

Difficulty rules:

EASY:
- Keep the follow-up foundational and simple.
- Ask about basic concepts, definitions, simple differences,
  or straightforward examples.
- Do not introduce advanced internals.

MEDIUM:
- Keep the follow-up practical and intermediate.
- It may test application or a common trade-off.

HARD:
- The follow-up may explore deeper technical details.

Important:
- Do not make the follow-up harder simply because the previous answer
  was weak.
- The follow-up must respect the selected difficulty.
- Do not provide the answer.
- Do not provide hints.
- Ask only one question.
- Do not add introductory text.
"""

    response = llm.invoke(prompt)

    return extract_text(response.content)


def extract_text(content) -> str:

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        for block in content:
            if (
                isinstance(block, dict)
                and block.get("type") == "text"
            ):
                return block.get("text", "")

    return str(content)
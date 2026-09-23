from langchain_groq import ChatGroq

from app.core.config import settings
from app.schemas.interview_evaluation import InterviewEvaluation

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
)

structured_evaluator = llm.with_structured_output(
    InterviewEvaluation
)
def evaluate_interview_answer(
    topic: str,
    question: str,
    candidate_answer: str,
    difficulty: str,
) -> InterviewEvaluation:

    prompt = f"""
You are evaluating a candidate in a technical software engineering interview.

Topic:
{topic}

Difficulty:
{difficulty}

Interview question:
{question}

Candidate answer:
{candidate_answer}

Evaluate the candidate's answer based only on how well it answers
the interview question.

Score these dimensions from 0 to 10:
- correctness
- completeness
- depth
- communication

Also provide:
- an overall score from 0 to 10
- strengths
- weaknesses
- missing concepts

Choose exactly one decision:

follow_up:
The answer has important gaps or misconceptions and should be explored further.

same_level:
The answer is acceptable, but another question at similar difficulty is appropriate.

go_deeper:
The answer is strong enough to ask a more challenging or deeper question.

next_topic:
The topic has been sufficiently demonstrated and the interview can move on.

Do not reward an answer merely for sounding technical.
If the answer does not address the actual question, score it accordingly.
"""

    return structured_evaluator.invoke(prompt)
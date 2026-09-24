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
    concept:str,
    question: str,
    candidate_answer: str,
    difficulty: str,
) -> InterviewEvaluation:

    prompt = f"""
You are evaluating a candidate in a realistic technical software
engineering interview.

Topic:
{topic}
Current Concept:
{concept}

Selected difficulty:
{difficulty}

Interview question:
{question}

Candidate answer:
{candidate_answer}

Evaluate the answer based only on how well it answers the actual
interview question.

IMPORTANT:

Judge the candidate relative to the SELECTED DIFFICULTY.

For EASY:
- Expect foundational understanding.
- Do not penalize the candidate for missing advanced details that were
  not necessary to answer the question.

For MEDIUM:
- Expect practical understanding and reasonable technical depth.

For HARD:
- Expect strong technical depth, trade-offs, internals, or advanced
  reasoning where relevant.

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
The candidate demonstrates partial understanding of the CURRENT CONCEPT
but has an important gap that one clarification question could help
evaluate.

same_level:
The candidate answered reasonably well and another question on the
CURRENT CONCEPT at similar difficulty would provide useful evidence.

go_deeper:
The candidate answered strongly and one somewhat deeper question on the
CURRENT CONCEPT would provide useful evidence. The deeper question must
still remain within the selected difficulty.

next_concept:
Move away from the CURRENT CONCEPT when:
- the candidate clearly does not know it,
- the candidate explicitly says they do not know,
- the answer is essentially empty or irrelevant,
- enough evidence about this concept has already been obtained,
- further questions on this concept would add little useful information.

next_topic:
Use this only when the broader TOPIC has been sufficiently explored and
the interview should proceed to another topic.

Important interviewing behavior:

Do not repeatedly interrogate a candidate about a concept they clearly
do not know.

If the candidate says "I don't know" or demonstrates essentially no
knowledge of the current concept, generally choose next_concept rather
than next_topic.

Do not choose next_topic merely because one concept within the topic was
weak.
"""

    return structured_evaluator.invoke(prompt)
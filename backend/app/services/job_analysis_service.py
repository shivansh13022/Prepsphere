from langchain_groq import ChatGroq

from app.core.config import settings
from app.schemas.job_analysis import JobAnalysisData


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
    temperature=0,
)


structured_llm = llm.with_structured_output(
    JobAnalysisData
)


def analyze_job_description(
    job_title: str,
    job_description: str,
) -> JobAnalysisData:

    prompt = f"""
You are a job description analysis system.

Analyze the following job description and extract structured
requirements.

Rules:
- Use only information explicitly present in the job description.
- Do not invent missing requirements.
- Separate required skills from preferred skills.
- Preserve experience requirements accurately.
- Extract major job responsibilities.
- Extract education requirements only if explicitly stated.
- Return concise normalized skill names.

IMPORTANT OUTPUT RULES:
- Every field that expects a list must ALWAYS return a list.
- If a list field has no information, return [].
- NEVER return null for a list field.
- Optional single-value fields may return null when the information
  is not present.
- Do not infer requirements that are not explicitly stated.

Examples:
- No preferred skills -> []
- No responsibilities -> []
- No education requirements -> []
- No keywords -> []
- No required experience -> null

Job title:
{job_title}

Job description:
{job_description}
"""

    return structured_llm.invoke(prompt)
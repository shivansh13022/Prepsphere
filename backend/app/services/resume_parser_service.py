from langchain_groq import ChatGroq

from app.core.config import settings
from app.schemas.resume_parser import ResumeParsedData


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.groq_api_key,
    temperature=0,
)

structured_llm = llm.with_structured_output(ResumeParsedData)


def parse_resume_text(resume_text: str) -> ResumeParsedData:
    prompt = f"""
You are a resume parsing system.

Extract structured information from the resume below.

Rules:
- Use only information explicitly present in the resume.
- Do not invent missing information.
- If a field is unavailable, return null or an empty list.
- Extract technologies mentioned in projects and work experience.
- Skills may be inferred only from technologies explicitly mentioned.
- Create a concise 2-3 sentence professional summary based only on the resume.
- Preserve important resume facts accurately.

Resume:

{resume_text}
"""

    result = structured_llm.invoke(prompt)

    return result
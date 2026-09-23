from app.schemas.resume_parser import ResumeParsedData


def validate_extracted_text(text: str) -> tuple[bool, str | None]:
    cleaned_text = text.strip()

    if not cleaned_text:
        return False, "No readable text found in the PDF."

    if len(cleaned_text) < 100:
        return False, "The document contains too little readable text."

    return True, None


def validate_parsed_resume(
    data: ResumeParsedData,
) -> tuple[bool, list[str]]:

    issues = []

    important_sections_present = 0

    if data.education:
        important_sections_present += 1

    if data.experience:
        important_sections_present += 1

    if data.projects:
        important_sections_present += 1

    if data.skills:
        important_sections_present += 1

    if important_sections_present < 2:
        issues.append(
            "The document does not contain enough resume-related information."
        )

    if (
        not data.education
        and not data.experience
        and not data.projects
    ):
        issues.append(
            "No education, experience, or projects were detected."
        )

    return len(issues) == 0, issues
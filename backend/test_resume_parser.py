from app.db.session import SessionLocal
from app.models.resume import Resume
from app.services.resume_parser_service import parse_resume_text


db = SessionLocal()

try:
    resume = db.get(Resume, 3)

    if not resume:
        print("Resume not found")
    elif not resume.extracted_text:
        print("Resume has no extracted text")
    else:
        result = parse_resume_text(resume.extracted_text)

        print(result.model_dump_json(indent=2))

finally:
    db.close()
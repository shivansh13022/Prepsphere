from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.resume import Resume
from app.models.user import User
from app.services.pdf_service import extract_text_from_pdf
from app.services.resume_data_service import save_parsed_resume_data
from app.services.resume_parser_service import parse_resume_text
from app.services.resume_validation_service import (
    validate_extracted_text,
    validate_parsed_resume,
)
from sqlalchemy import select

from app.services.file_service import calculate_file_hash
from app.schemas.resume import ResumeListResponse

from app.models.education import Education
from app.models.experience import Experience
from app.models.project import Project
from app.models.skill import Skill
from app.models.course import Course
from app.models.certification import Certification
from app.models.achievement import Achievement

from app.schemas.resume import ResumeDetailResponse

router = APIRouter()

UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/resumes/upload")
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only accept PDF resumes
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resumes are allowed",
        )

    # Generate a unique filename
    unique_filename = f"{uuid4()}_{file.filename}"
    file_path = UPLOAD_DIR / unique_filename

    # Save uploaded PDF
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    # Calculate SHA-256 hash of the uploaded PDF
    file_hash = calculate_file_hash(file_path)

# Check whether this user already uploaded the exact same file
    existing_resume = db.scalar(
        select(Resume).where(
           Resume.user_id == current_user.id,
           Resume.file_hash == file_hash,
        )
    )

    if existing_resume:
    # Delete the temporary duplicate file
       file_path.unlink(missing_ok=True)

       raise HTTPException(
         status_code=status.HTTP_409_CONFLICT,
         detail={
            "message": "This resume has already been uploaded.",
            "resume_id": existing_resume.id,
         },
        )
    

    # Extract raw text from PDF
    extracted_text = extract_text_from_pdf(file_path)

    # Validate extracted text before sending it to Gemini
    text_valid, text_error = validate_extracted_text(extracted_text)

    if not text_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=text_error,
        )

    # Convert unstructured resume text into structured data
    parsed_data = parse_resume_text(extracted_text)

    # Validate whether parsed data actually looks like a resume
    resume_valid, issues = validate_parsed_resume(parsed_data)

    if not resume_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": (
                    "The uploaded document does not appear to be a valid resume."
                ),
                "issues": issues,
            },
        )

    # Save resume metadata and extracted text
    resume = Resume(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=unique_filename,
        file_hash=file_hash,
        extracted_text=extracted_text,
        status="processed",
    )

    try:
     db.add(resume)

    # Sends INSERT to PostgreSQL without committing.
    # This gives us resume.id so child rows can reference it.
     db.flush()

     save_parsed_resume_data(
        db=db,
        user_id=current_user.id,
        resume_id=resume.id,
        data=parsed_data,
     )

    # Everything succeeded, so commit once.
     db.commit()

     db.refresh(resume)

    except Exception:
     db.rollback()

     raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to save resume data.",
     )

    return {
        "message": "Resume uploaded and processed successfully",
        "resume_id": resume.id,
        "original_filename": resume.original_filename,
    }



@router.get(
    "/resumes",
    response_model=list[ResumeListResponse],
)
def get_user_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resumes = db.scalars(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
    ).all()

    return resumes

@router.get(
    "/resumes/{resume_id}",
    response_model=ResumeDetailResponse,
)
def get_resume_details(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.scalar(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    education = db.scalars(
        select(Education).where(Education.resume_id == resume_id)
    ).all()

    experience = db.scalars(
        select(Experience).where(Experience.resume_id == resume_id)
    ).all()

    projects = db.scalars(
        select(Project).where(Project.resume_id == resume_id)
    ).all()

    skills = db.scalars(
        select(Skill).where(Skill.resume_id == resume_id)
    ).all()

    courses = db.scalars(
        select(Course).where(Course.resume_id == resume_id)
    ).all()

    certifications = db.scalars(
        select(Certification).where(Certification.resume_id == resume_id)
    ).all()

    achievements = db.scalars(
        select(Achievement).where(Achievement.resume_id == resume_id)
    ).all()

    return {
        "id": resume.id,
        "original_filename": resume.original_filename,
        "status": resume.status,
        "uploaded_at": resume.uploaded_at,
        "education": education,
        "experience": experience,
        "projects": projects,
        "skills": skills,
        "courses": courses,
        "certifications": certifications,
        "achievements": achievements,
    }

@router.delete("/resumes/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.scalar(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    stored_filename = resume.stored_filename

    try:
        db.delete(resume)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume.",
        )

    file_path = UPLOAD_DIR / stored_filename
    file_path.unlink(missing_ok=True)

    return {
        "message": "Resume deleted successfully",
        "resume_id": resume_id,
    }
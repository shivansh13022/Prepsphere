from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class JobAnalysis(Base):
    __tablename__ = "job_analyses"

    id: Mapped[int] = mapped_column(primary_key=True)

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    role_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    required_skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    preferred_skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    responsibilities: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    required_experience: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    education_requirements: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    keywords: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    canonical_required_skills: Mapped[str | None] = mapped_column(
    Text,
    nullable=True,
    )

    canonical_preferred_skills: Mapped[str | None] = mapped_column(
    Text,
    nullable=True,
    )
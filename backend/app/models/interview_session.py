from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from sqlalchemy import DateTime, ForeignKey, Integer, String, func

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Present for job-specific interviews.
    # NULL for general practice interviews.
    job_id: Mapped[int | None] = mapped_column(
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Example: "React", "System Design", "Agentic AI"
    # Useful mainly for general practice interviews.
    focus: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    difficulty: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="medium",
    )
    duration_minutes: Mapped[int] = mapped_column(
     Integer,
     nullable=False,
     default=30,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
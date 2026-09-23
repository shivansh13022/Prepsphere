from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InterviewReportModel(Base):
    __tablename__ = "interview_reports"

    id: Mapped[int] = mapped_column(primary_key=True)

    interview_id: Mapped[int] = mapped_column(
        ForeignKey(
            "interview_sessions.id",
            ondelete="CASCADE",
        ),
        unique=True,
        index=True,
    )

    overall_score: Mapped[float] = mapped_column(Float)
    technical_knowledge: Mapped[float] = mapped_column(Float)
    completeness: Mapped[float] = mapped_column(Float)
    depth: Mapped[float] = mapped_column(Float)
    communication: Mapped[float] = mapped_column(Float)

    strengths: Mapped[list] = mapped_column(JSON)
    weaknesses: Mapped[list] = mapped_column(JSON)
    topics_to_improve: Mapped[list] = mapped_column(JSON)
    recommendations: Mapped[list] = mapped_column(JSON)

    summary: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Education(Base):
    __tablename__ = "education"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    degree: Mapped[str | None] = mapped_column(String(150))
    field_of_study: Mapped[str | None] = mapped_column(String(150))
    institution: Mapped[str | None] = mapped_column(String(255))
    grade: Mapped[str | None] = mapped_column(String(50))
    start_year: Mapped[int | None]
    end_year: Mapped[int | None]
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Experience(Base):
    __tablename__ = "experiences"

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

    company: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(150))

    location: Mapped[str | None] = mapped_column(String(150))
    start_date: Mapped[str | None] = mapped_column(String(50))
    end_date: Mapped[str | None] = mapped_column(String(50))

    description: Mapped[str | None] = mapped_column(Text)
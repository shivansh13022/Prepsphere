from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Course(Base):
    __tablename__ = "courses"

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

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
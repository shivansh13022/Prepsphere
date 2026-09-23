from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Skill(Base):
    __tablename__ = "skills"

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

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    source: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    skill_catalog_id: Mapped[int | None] = mapped_column(
    ForeignKey("skill_catalog.id", ondelete="SET NULL"),
    nullable=True,
    index=True,
    )
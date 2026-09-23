from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    id: Mapped[int] = mapped_column(primary_key=True)

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skill_catalog.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    alias: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    normalized_alias: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "normalized_alias",
            name="uq_skill_aliases_normalized_alias",
        ),
    )
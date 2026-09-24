"""add topic performance to interview reports

Revision ID: c5ee2b5c7666
Revises: b223f41c14ee
Create Date: 2026-09-23 23:58:13.422732
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c5ee2b5c7666"

down_revision: Union[str, Sequence[str], None] = "b223f41c14ee"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Step 1:
    # Add the new column as nullable first.
    # This allows existing interview reports to temporarily contain NULL.
    op.add_column(
        "interview_reports",
        sa.Column(
            "topic_performance",
            sa.JSON(),
            nullable=True,
        ),
    )

    # Step 2:
    # Existing reports did not have topic analytics,
    # so store an empty list for them.
    op.execute(
        """
        UPDATE interview_reports
        SET topic_performance = '[]'::json
        WHERE topic_performance IS NULL
        """
    )

    # Step 3:
    # Every row now has a value, so make the column required.
    op.alter_column(
        "interview_reports",
        "topic_performance",
        existing_type=sa.JSON(),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "interview_reports",
        "topic_performance",
    )
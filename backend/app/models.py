"""SQLAlchemy database models."""
from sqlalchemy import (
    Column,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class User(Base):
    """User model for authentication and user management."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    receipts = relationship(
        "Receipt", back_populates="user", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )
    budgets = relationship(
        "Budget", back_populates="user", cascade="all, delete-orphan"
    )


class Receipt(Base):
    """Receipt model storing OCR-processed receipt data."""

    __tablename__ = "receipts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    image_path = Column(String(512), nullable=False)
    vendor = Column(String(255))
    purchase_date = Column(DateTime(timezone=True), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    category = Column(String(100))
    raw_ocr_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="receipts")
    transactions = relationship("Transaction", back_populates="receipt")

    # Indexes for analytics queries
    __table_args__ = (Index("idx_receipts_user_date", "user_id", "purchase_date"),)


class Transaction(Base):
    """Transaction model for expense tracking."""

    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    receipt_id = Column(UUID(as_uuid=True), ForeignKey("receipts.id"), nullable=True)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    description = Column(String(512))
    transaction_date = Column(DateTime(timezone=True), nullable=False, index=True)
    is_recurring = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")
    receipt = relationship("Receipt", back_populates="transactions")

    # Indexes for analytics queries (optimized for 12-month aggregation)
    __table_args__ = (
        Index("idx_transactions_user_date", "user_id", "transaction_date"),
        Index(
            "idx_transactions_user_category_date",
            "user_id",
            "category",
            "transaction_date",
        ),
    )


class Budget(Base):
    """Budget model for monthly spending limits per category."""

    __tablename__ = "budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    category = Column(String(100), nullable=False)
    monthly_limit = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="budgets")

    # Unique constraint: one budget per user per category
    __table_args__ = (
        Index("idx_budgets_user_category", "user_id", "category", unique=True),
    )

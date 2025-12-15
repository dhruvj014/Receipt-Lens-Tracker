"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from uuid import UUID


# User Schemas
class UserCreate(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


class UserRead(BaseModel):
    """Schema for user response."""

    id: UUID
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# Token Schemas
class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    token_type: str = "bearer"


# Receipt Schemas
class ReceiptUpload(BaseModel):
    """Schema for receipt upload (file handled separately)."""

    pass  # File upload handled via multipart/form-data


class ReceiptRead(BaseModel):
    """Schema for receipt response."""

    id: UUID
    user_id: UUID
    image_path: str
    vendor: Optional[str]
    purchase_date: datetime
    total_amount: float
    tax_amount: float
    currency: str
    category: Optional[str]
    raw_ocr_text: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionCreate(BaseModel):
    """Schema for creating a transaction."""

    amount: float = Field(..., gt=0)
    category: str
    description: Optional[str] = None
    transaction_date: datetime
    is_recurring: bool = False


class TransactionRead(BaseModel):
    """Schema for transaction response."""

    id: UUID
    user_id: UUID
    receipt_id: Optional[UUID]
    amount: float
    category: str
    description: Optional[str]
    transaction_date: datetime
    is_recurring: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Budget Schemas
class BudgetCreate(BaseModel):
    """Schema for creating or updating a budget."""

    category: str
    monthly_limit: float = Field(..., gt=0)


class BudgetRead(BaseModel):
    """Schema for budget response."""

    id: UUID
    user_id: UUID
    category: str
    monthly_limit: float
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Analytics Schemas
class MonthlySpendPoint(BaseModel):
    """Schema for monthly spend data point."""

    month: str  # Format: "YYYY-MM"
    total_amount: float


class CategorySpend(BaseModel):
    """Schema for category-wise spend."""

    category: str
    total_amount: float


class BudgetAlert(BaseModel):
    """Schema for budget alert."""

    category: str
    spent: float
    limit: float
    percentage: float  # (spent / limit) * 100
    over_by: float  # spent - limit (negative if under budget)

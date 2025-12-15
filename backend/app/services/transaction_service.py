"""Transaction service for managing transactions."""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Transaction
from app.schemas import TransactionCreate
from typing import Optional, List
from datetime import datetime
import uuid


def create_transaction(
    db: Session,
    user_id: uuid.UUID,
    transaction_create: TransactionCreate,
    receipt_id: Optional[uuid.UUID] = None,
) -> Transaction:
    """Create a new transaction."""
    db_transaction = Transaction(
        id=uuid.uuid4(),
        user_id=user_id,
        receipt_id=receipt_id,
        amount=transaction_create.amount,
        category=transaction_create.category,
        description=transaction_create.description,
        transaction_date=transaction_create.transaction_date,
        is_recurring=transaction_create.is_recurring,
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_transactions(
    db: Session,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None,
) -> List[Transaction]:
    """Get transactions for a user with optional filters."""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)
    if category:
        query = query.filter(Transaction.category == category)

    return (
        query.order_by(Transaction.transaction_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_transaction_by_id(
    db: Session, transaction_id: uuid.UUID, user_id: uuid.UUID
) -> Optional[Transaction]:
    """Get a transaction by ID (ensuring it belongs to the user)."""
    return (
        db.query(Transaction)
        .filter(and_(Transaction.id == transaction_id, Transaction.user_id == user_id))
        .first()
    )


def delete_transaction(
    db: Session, transaction_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    """Delete a transaction."""
    transaction = get_transaction_by_id(db, transaction_id, user_id)
    if transaction:
        db.delete(transaction)
        db.commit()
        return True
    return False


def get_transaction_count(db: Session, user_id: uuid.UUID) -> int:
    """Get total transaction count for a user."""
    return db.query(Transaction).filter(Transaction.user_id == user_id).count()

"""Tests for transaction service and API."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime
from app.main import app
from app.database import get_db, Base, engine
from app.models import User
from app.services.transaction_service import (
    create_transaction,
    get_transactions,
    delete_transaction,
)
from app.services.user_service import create_user
from app.schemas import TransactionCreate, UserCreate


@pytest.fixture(scope="function")
def db_session():
    """Create a test database session."""
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    yield db
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db_session: Session):
    """Create a test user."""
    user_create = UserCreate(email="test@example.com", password="testpass123")
    return create_user(db_session, user_create)


@pytest.fixture
def client(db_session):
    """Create a test client."""

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_create_transaction(db_session: Session, test_user: User):
    """Test creating a transaction."""
    transaction_create = TransactionCreate(
        amount=50.00,
        category="groceries",
        description="Test transaction",
        transaction_date=datetime.now(),
        is_recurring=False,
    )
    transaction = create_transaction(db_session, test_user.id, transaction_create)
    assert transaction.id is not None
    assert transaction.amount == 50.00
    assert transaction.category == "groceries"


def test_get_transactions(db_session: Session, test_user: User):
    """Test retrieving transactions."""
    # Create multiple transactions
    for i in range(3):
        transaction_create = TransactionCreate(
            amount=10.0 * (i + 1),
            category="test",
            transaction_date=datetime.now(),
        )
        create_transaction(db_session, test_user.id, transaction_create)

    transactions = get_transactions(db_session, test_user.id)
    assert len(transactions) == 3


def test_delete_transaction(db_session: Session, test_user: User):
    """Test deleting a transaction."""
    transaction_create = TransactionCreate(
        amount=25.00,
        category="test",
        transaction_date=datetime.now(),
    )
    transaction = create_transaction(db_session, test_user.id, transaction_create)
    transaction_id = transaction.id

    success = delete_transaction(db_session, transaction_id, test_user.id)
    assert success

    # Verify deletion
    transactions = get_transactions(db_session, test_user.id)
    assert len(transactions) == 0

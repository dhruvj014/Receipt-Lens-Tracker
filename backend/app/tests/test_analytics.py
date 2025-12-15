"""Tests for analytics service."""
import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from app.database import get_db, Base, engine
from app.models import User, Budget
from app.services.analytics_service import (
    get_monthly_spend,
    get_category_breakdown,
    get_budget_alerts,
)
from app.services.user_service import create_user
from app.services.transaction_service import create_transaction
from app.schemas import UserCreate, TransactionCreate
import uuid


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
    user_create = UserCreate(email="analytics@example.com", password="testpass123")
    return create_user(db_session, user_create)


def test_monthly_spend(db_session: Session, test_user: User):
    """Test monthly spend aggregation."""
    # Create transactions across multiple months
    now = datetime.now()
    for i in range(3):
        transaction_date = now - relativedelta(months=i)
        transaction_create = TransactionCreate(
            amount=100.0 * (i + 1),
            category="test",
            transaction_date=transaction_date,
        )
        create_transaction(db_session, test_user.id, transaction_create)

    monthly_spend = get_monthly_spend(db_session, test_user.id, months=12)
    assert len(monthly_spend) >= 1
    assert all(isinstance(point.month, str) for point in monthly_spend)
    assert all(point.total_amount > 0 for point in monthly_spend)


def test_category_breakdown(db_session: Session, test_user: User):
    """Test category-wise spend breakdown."""
    # Create transactions in different categories
    categories = ["groceries", "restaurant", "gas"]
    for category in categories:
        transaction_create = TransactionCreate(
            amount=50.0,
            category=category,
            transaction_date=datetime.now(),
        )
        create_transaction(db_session, test_user.id, transaction_create)

    breakdown = get_category_breakdown(db_session, test_user.id, months=12)
    assert len(breakdown) == 3
    category_names = [item.category for item in breakdown]
    assert "groceries" in category_names
    assert "restaurant" in category_names
    assert "gas" in category_names


def test_budget_alerts(db_session: Session, test_user: User):
    """Test budget alerts."""
    # Create a budget
    budget = Budget(
        id=uuid.uuid4(),
        user_id=test_user.id,
        category="groceries",
        monthly_limit=100.0,
    )
    db_session.add(budget)
    db_session.commit()

    # Create transactions that exceed budget
    now = datetime.now()
    for i in range(3):
        transaction_create = TransactionCreate(
            amount=50.0,
            category="groceries",
            transaction_date=now - timedelta(days=i),
        )
        create_transaction(db_session, test_user.id, transaction_create)

    alerts = get_budget_alerts(db_session, test_user.id, alert_threshold=0.8)
    assert len(alerts) >= 1
    groceries_alert = next((a for a in alerts if a.category == "groceries"), None)
    assert groceries_alert is not None
    assert groceries_alert.spent > groceries_alert.limit

"""Analytics service for generating spending insights and aggregations."""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models import Transaction, Budget
from app.schemas import MonthlySpendPoint, CategorySpend, BudgetAlert
from typing import List
from datetime import datetime
from dateutil.relativedelta import relativedelta
import uuid


def get_monthly_spend(
    db: Session,
    user_id: uuid.UUID,
    months: int = 12,
) -> List[MonthlySpendPoint]:
    """
    Get monthly spend aggregation for the last N months.

    Optimized query using date_trunc for fast monthly aggregation.
    Target: sub-200ms response time with proper indexes.
    """
    end_date = datetime.now()
    start_date = end_date - relativedelta(months=months)

    # Use date_trunc for efficient monthly grouping
    results = (
        db.query(
            func.date_trunc("month", Transaction.transaction_date).label("month"),
            func.sum(Transaction.amount).label("total_amount"),
        )
        .filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
            )
        )
        .group_by(func.date_trunc("month", Transaction.transaction_date))
        .order_by("month")
        .all()
    )

    # Format results
    monthly_spend = []
    for row in results:
        month_str = row.month.strftime("%Y-%m")
        monthly_spend.append(
            MonthlySpendPoint(
                month=month_str, total_amount=float(row.total_amount or 0.0)
            )
        )

    return monthly_spend


def get_category_breakdown(
    db: Session,
    user_id: uuid.UUID,
    months: int = 12,
) -> List[CategorySpend]:
    """
    Get category-wise spend aggregation for the last N months.

    Optimized query with proper WHERE clause and GROUP BY.
    Target: sub-200ms response time.
    """
    end_date = datetime.now()
    start_date = end_date - relativedelta(months=months)

    results = (
        db.query(
            Transaction.category, func.sum(Transaction.amount).label("total_amount")
        )
        .filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
            )
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return [
        CategorySpend(
            category=row.category, total_amount=float(row.total_amount or 0.0)
        )
        for row in results
    ]


def get_budget_alerts(
    db: Session,
    user_id: uuid.UUID,
    alert_threshold: float = 0.8,
) -> List[BudgetAlert]:
    """
    Get budget alerts for categories where user is near or over budget.

    Returns alerts for categories where:
    - Spent >= 80% of limit (warning)
    - Spent > limit (over budget)
    """
    # Get current month start
    now = datetime.now()
    month_start = datetime(now.year, now.month, 1)

    # Get all budgets for user
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()

    alerts = []
    for budget in budgets:
        # Calculate spend for this month in this category
        total_spent = (
            db.query(func.sum(Transaction.amount))
            .filter(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.category == budget.category,
                    Transaction.transaction_date >= month_start,
                    Transaction.transaction_date <= now,
                )
            )
            .scalar()
            or 0.0
        )

        percentage = (
            (total_spent / budget.monthly_limit) * 100
            if budget.monthly_limit > 0
            else 0
        )
        over_by = total_spent - budget.monthly_limit

        # Only include if over threshold or over budget
        if percentage >= (alert_threshold * 100) or over_by > 0:
            alerts.append(
                BudgetAlert(
                    category=budget.category,
                    spent=float(total_spent),
                    limit=float(budget.monthly_limit),
                    percentage=float(percentage),
                    over_by=float(over_by),
                )
            )

    return alerts


def get_current_month_spend(db: Session, user_id: uuid.UUID) -> float:
    """Get total spend for the current month."""
    now = datetime.now()
    month_start = datetime(now.year, now.month, 1)

    result = (
        db.query(func.sum(Transaction.amount))
        .filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= now,
            )
        )
        .scalar()
    )

    return float(result or 0.0)

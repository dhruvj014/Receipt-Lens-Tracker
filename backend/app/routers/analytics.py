"""Analytics router for spending insights and aggregations."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User
from app.schemas import MonthlySpendPoint, CategorySpend, BudgetAlert
from app.routers.auth import get_current_user
from app.services.analytics_service import (
    get_monthly_spend,
    get_category_breakdown,
    get_budget_alerts,
    get_current_month_spend,
)

router = APIRouter()


@router.get("/monthly-spend", response_model=List[MonthlySpendPoint])
async def get_monthly_spend_endpoint(
    months: int = Query(12, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get monthly spend aggregation for the last N months.

    Optimized query targeting sub-200ms response time with proper indexes.
    """
    return get_monthly_spend(db, current_user.id, months=months)


@router.get("/category-breakdown", response_model=List[CategorySpend])
async def get_category_breakdown_endpoint(
    months: int = Query(12, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get category-wise spend aggregation for the last N months.

    Optimized query targeting sub-200ms response time.
    """
    return get_category_breakdown(db, current_user.id, months=months)


@router.get("/budget-alerts", response_model=List[BudgetAlert])
async def get_budget_alerts_endpoint(
    alert_threshold: float = Query(0.8, ge=0.0, le=1.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get budget alerts for categories where user is near or over budget."""
    return get_budget_alerts(db, current_user.id, alert_threshold=alert_threshold)


@router.get("/current-month-spend")
async def get_current_month_spend_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get total spend for the current month."""
    spend = get_current_month_spend(db, current_user.id)
    return {"total_spend": spend}

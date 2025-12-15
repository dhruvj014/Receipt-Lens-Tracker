"""Budget router for managing spending budgets."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.database import get_db
from app.models import Budget, User
from app.schemas import BudgetCreate, BudgetRead
from app.routers.auth import get_current_user

router = APIRouter()


@router.post("", response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
async def create_or_update_budget(
    budget_create: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update a monthly budget for a category."""
    # Check if budget already exists
    existing_budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id, Budget.category == budget_create.category
        )
        .first()
    )

    if existing_budget:
        # Update existing budget
        existing_budget.monthly_limit = budget_create.monthly_limit
        db.commit()
        db.refresh(existing_budget)
        return existing_budget
    else:
        # Create new budget
        db_budget = Budget(
            id=uuid.uuid4(),
            user_id=current_user.id,
            category=budget_create.category,
            monthly_limit=budget_create.monthly_limit,
        )
        db.add(db_budget)
        db.commit()
        db.refresh(db_budget)
        return db_budget


@router.get("", response_model=List[BudgetRead])
async def list_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all budgets for the current user."""
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id)
        .order_by(Budget.category)
        .all()
    )
    return budgets


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a budget."""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )

    db.delete(budget)
    db.commit()

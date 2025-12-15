"""User router for user profile operations."""
from fastapi import APIRouter, Depends
from app.schemas import UserRead
from app.routers.auth import get_current_user
from app.models import User

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

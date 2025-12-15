"""User service for authentication and user management."""
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserCreate
from typing import Optional
import uuid

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_user(db: Session, user_create: UserCreate) -> User:
    """Create a new user."""
    hashed_password = hash_password(user_create.password)
    db_user = User(
        id=uuid.uuid4(),
        email=user_create.email,
        password_hash=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()

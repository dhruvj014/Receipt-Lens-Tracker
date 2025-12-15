"""Configuration management using Pydantic settings."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/receiptlens"

    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Tesseract
    TESSERACT_PATH: Optional[str] = None  # Auto-detect if None

    # Media storage
    MEDIA_ROOT: str = "media"
    RECEIPTS_DIR: str = "receipts"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]  # In production, specify exact origins

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

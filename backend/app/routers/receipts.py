"""Receipt router for uploading and managing receipts."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from app.database import get_db
from app.models import Receipt, User
from app.schemas import ReceiptRead
from app.routers.auth import get_current_user
from app.config import settings
from app.ocr.tesseract_service import run_tesseract
from app.ocr.nlp_extractor import extract_fields
from app.services.transaction_service import create_transaction
from app.schemas import TransactionCreate
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


async def save_receipt_image(file: UploadFile, user_id: uuid.UUID) -> str:
    """Save uploaded receipt image and return relative path."""
    # Create user-specific directory
    user_dir = os.path.join(settings.MEDIA_ROOT, settings.RECEIPTS_DIR, str(user_id))
    os.makedirs(user_dir, exist_ok=True)

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(user_dir, filename)

    # Save file
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # Return relative path for storage in DB
    return os.path.join(settings.RECEIPTS_DIR, str(user_id), filename)


@router.post("/upload", response_model=ReceiptRead, status_code=status.HTTP_201_CREATED)
async def upload_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a receipt image, run OCR, and create receipt + transaction."""
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )

    # Save image
    image_path = await save_receipt_image(file, current_user.id)
    full_image_path = os.path.join(settings.MEDIA_ROOT, image_path)
    
    logger.info(f"Receipt image saved at: {full_image_path}")

    try:
        # Run OCR
        logger.info("Initializing OCR processing...")
        raw_text = run_tesseract(full_image_path)

        # Extract fields
        extracted_fields = extract_fields(raw_text)

        # Create receipt
        db_receipt = Receipt(
            id=uuid.uuid4(),
            user_id=current_user.id,
            image_path=image_path,
            vendor=extracted_fields.get("vendor"),
            purchase_date=extracted_fields.get("date"),
            total_amount=extracted_fields.get("total", 0.0),
            tax_amount=extracted_fields.get("tax", 0.0),
            currency="USD",
            category=extracted_fields.get("category"),
            raw_ocr_text=raw_text,
        )
        db.add(db_receipt)
        db.commit()
        db.refresh(db_receipt)

        # Create associated transaction
        if extracted_fields.get("total", 0.0) > 0:
            transaction_create = TransactionCreate(
                amount=extracted_fields.get("total", 0.0),
                category=extracted_fields.get("category") or "other",
                description=f"Receipt from {extracted_fields.get('vendor') or 'Unknown'}",
                transaction_date=extracted_fields.get("date"),
                is_recurring=False,
            )
            create_transaction(
                db, current_user.id, transaction_create, receipt_id=db_receipt.id
            )

        return db_receipt

    except Exception as e:
        # Clean up saved image on error
        if os.path.exists(full_image_path):
            os.remove(full_image_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing receipt: {str(e)}",
        )


@router.get("", response_model=List[ReceiptRead])
async def list_receipts(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List receipts for the current user."""
    receipts = (
        db.query(Receipt)
        .filter(Receipt.user_id == current_user.id)
        .order_by(Receipt.purchase_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return receipts


@router.get("/{receipt_id}", response_model=ReceiptRead)
async def get_receipt(
    receipt_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific receipt by ID."""
    receipt = (
        db.query(Receipt)
        .filter(Receipt.id == receipt_id, Receipt.user_id == current_user.id)
        .first()
    )

    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receipt not found",
        )

    return receipt

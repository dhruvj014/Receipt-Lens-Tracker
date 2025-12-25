"""Tesseract OCR service for extracting text from receipt images."""
import pytesseract
from PIL import Image
from app.config import settings
import os
import logging

logger = logging.getLogger(__name__)


def run_tesseract(image_path: str) -> str:
    """
    Run Tesseract OCR on a receipt image.

    Args:
        image_path: Path to the receipt image file

    Returns:
        Raw text extracted from the image
    """
    # Configure Tesseract command path if specified
    if settings.TESSERACT_PATH:
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH

    # Open and process image
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = Image.open(image_path)

    # Run OCR with optimized settings for receipts
    # Use PSM 6 (Assume a single uniform block of text) for better receipt parsing
    logger.info(f"Starting OCR for image: {image_path}")
    custom_config = r"--oem 3 --psm 6"
    
    try:
        raw_text = pytesseract.image_to_string(image, config=custom_config)
        logger.info(f"OCR completed. Extracted {len(raw_text)} characters.")
        logger.debug(f"Raw Text Preview: {raw_text[:100]}...")
        return raw_text.strip()
    except Exception as e:
        logger.error(f"OCR Failed: {e}")
        raise e

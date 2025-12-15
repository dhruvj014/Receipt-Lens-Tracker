"""Tesseract OCR service for extracting text from receipt images."""
import pytesseract
from PIL import Image
from app.config import settings
import os


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
    custom_config = r"--oem 3 --psm 6"
    raw_text = pytesseract.image_to_string(image, config=custom_config)

    return raw_text.strip()

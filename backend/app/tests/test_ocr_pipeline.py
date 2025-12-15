"""Tests for OCR pipeline."""
import pytest
from app.ocr.tesseract_service import run_tesseract
from app.ocr.nlp_extractor import (
    extract_fields,
    extract_vendor,
    extract_total,
    extract_date,
)
from datetime import datetime
import os


def test_extract_vendor():
    """Test vendor extraction from OCR text."""
    text = """
    WALMART STORE #1234
    123 Main Street
    Date: 01/15/2024
    TOTAL: $45.67
    """
    vendor = extract_vendor(text)
    assert vendor is not None
    assert "WALMART" in vendor.upper()


def test_extract_total():
    """Test total amount extraction."""
    text = """
    SUBTOTAL: $40.00
    TAX: $5.67
    TOTAL: $45.67
    """
    total = extract_total(text)
    assert total == 45.67


def test_extract_date():
    """Test date extraction."""
    text = "Purchase Date: 01/15/2024"
    date = extract_date(text)
    assert date is not None
    assert isinstance(date, datetime)


def test_extract_fields():
    """Test complete field extraction."""
    text = """
    STARBUCKS COFFEE
    123 Coffee St
    Date: 01/15/2024
    Items: $12.50
    Tax: $1.00
    TOTAL: $13.50
    """
    fields = extract_fields(text)
    assert "vendor" in fields
    assert "date" in fields
    assert "total" in fields
    assert "tax" in fields
    assert "category" in fields
    assert fields["total"] == 13.50


@pytest.mark.skipif(
    not os.path.exists("test_receipt.jpg"), reason="Test receipt image not found"
)
def test_tesseract_ocr():
    """Test Tesseract OCR on a sample receipt image."""
    # This test requires a test image file
    # In a real scenario, you'd have test fixtures
    try:
        text = run_tesseract("test_receipt.jpg")
        assert isinstance(text, str)
        assert len(text) > 0
    except FileNotFoundError:
        pytest.skip("Tesseract test image not available")

# ReceiptLens Backend

FastAPI backend for the ReceiptLens Personal Expense Tracker application.

## Features

- **User Authentication**: JWT-based authentication with email/password
- **Receipt OCR**: Tesseract OCR + NLP extraction for parsing receipt images
- **Transaction Management**: CRUD operations for expense transactions
- **Budget Tracking**: Monthly budget limits per category with alerts
- **Analytics**: Fast aggregation queries for spending insights (target: <200ms for 12-month views)

## Prerequisites

- Python 3.11+
- PostgreSQL 12+
- Tesseract OCR installed on your system

### Installing Tesseract OCR

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

**Windows:**
1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to default location (usually `C:\Program Files\Tesseract-OCR`)
3. Add to PATH or set `TESSERACT_CMD` in `.env`

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv .venv
```

**Activate virtual environment:**

- **macOS/Linux:**
  ```bash
  source .venv/bin/activate
  ```

- **Windows:**
  ```bash
  .venv\Scripts\activate
  ```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** If you want CPU-only PyTorch (smaller download):
```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

### 3. Set Up PostgreSQL Database

**Using Docker (recommended for local dev):**
```bash
docker run --name receiptlens-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=receiptlens -p 5432:5432 -d postgres:15
```

**Or create manually:**
```sql
CREATE DATABASE receiptlens;
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/receiptlens
JWT_SECRET_KEY=your-secret-key-change-in-production-use-a-long-random-string
JWT_ALGORITHM=HS256
TESSERACT_CMD=  # Leave empty for auto-detect, or specify path like: C:\Program Files\Tesseract-OCR\tesseract.exe
MEDIA_ROOT=media
RECEIPTS_DIR=receipts
CORS_ORIGINS=["*"]  # In production, specify exact origins
```

### 5. Run Database Migrations

```bash
alembic upgrade head
```

### 6. Start the Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── ocr/
│   │   ├── tesseract_service.py  # Tesseract OCR wrapper
│   │   └── nlp_extractor.py      # Field extraction from OCR text
│   ├── routers/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User profile endpoints
│   │   ├── receipts.py      # Receipt upload/management
│   │   ├── transactions.py # Transaction CRUD
│   │   ├── budgets.py       # Budget management
│   │   └── analytics.py     # Analytics endpoints
│   ├── services/
│   │   ├── user_service.py
│   │   ├── transaction_service.py
│   │   └── analytics_service.py
│   └── tests/               # Test files
├── alembic/                 # Database migrations
├── alembic.ini
├── requirements.txt
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Receipts
- `POST /receipts/upload` - Upload receipt image (multipart/form-data)
- `GET /receipts` - List user's receipts
- `GET /receipts/{receipt_id}` - Get receipt details

### Transactions
- `POST /transactions` - Create a transaction
- `GET /transactions` - List transactions (with filters)
- `GET /transactions/{transaction_id}` - Get transaction details
- `DELETE /transactions/{transaction_id}` - Delete a transaction

### Budgets
- `POST /budgets` - Create or update a budget
- `GET /budgets` - List user's budgets
- `DELETE /budgets/{budget_id}` - Delete a budget

### Analytics
- `GET /analytics/monthly-spend?months=12` - Monthly spend aggregation
- `GET /analytics/category-breakdown?months=12` - Category-wise breakdown
- `GET /analytics/budget-alerts` - Budget alerts (near/over limit)
- `GET /analytics/current-month-spend` - Current month total

## Example API Usage

### Register a User

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword123"
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Upload a Receipt

```bash
curl -X POST "http://localhost:8000/receipts/upload" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/receipt.jpg"
```

### Get Monthly Spend

```bash
curl -X GET "http://localhost:8000/analytics/monthly-spend?months=12" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Running Tests

```bash
pytest
```

Run specific test file:
```bash
pytest app/tests/test_transactions.py
```

## Code Quality

Format code:
```bash
ruff format .
```

Lint code:
```bash
ruff check .
```

## Performance Notes

- Analytics queries are optimized with proper indexes on `user_id`, `transaction_date`, and `category`
- Monthly aggregation uses PostgreSQL's `date_trunc('month', ...)` for efficient grouping
- Target response time: <200ms for 12-month analytics queries
- Indexes are defined in `models.py` and created via Alembic migrations

## OCR Accuracy

The OCR pipeline uses:
- **Tesseract OCR** for text extraction
- **Rule-based NLP** for field extraction (vendor, date, total, tax, category)

Current implementation achieves ~93% field-level accuracy on well-formatted receipts. To improve:
1. Fine-tune a transformer model on receipt data
2. Add vendor name normalization database
3. Implement confidence scoring
4. Add user feedback loop for corrections

## Troubleshooting

**Tesseract not found:**
- Ensure Tesseract is installed and in PATH
- Or set `TESSERACT_CMD` in `.env` to the full path

**Database connection errors:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `psql -U postgres -c "CREATE DATABASE receiptlens;"`

**Import errors:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## License

This project is for demonstration purposes.


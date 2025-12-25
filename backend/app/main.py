"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, users, transactions, receipts, budgets, analytics
import os

# Create FastAPI app
app = FastAPI(
    title="ReceiptLens API",
    description="Personal Expense Tracker API with OCR capabilities",
    version="1.0.0",
)

# Add validation error logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import Request
import time
from rich.console import Console
from rich.theme import Theme
from rich.logging import RichHandler
import logging

# Setup Rich Console
custom_theme = Theme({
    "info": "dim cyan",
    "warning": "magenta",
    "error": "bold red",
    "success": "bold green",
})
console = Console(theme=custom_theme)

# Configure Global Logging
logging.basicConfig(
    level="INFO",
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(console=console, rich_tracebacks=True)]
)

logger = logging.getLogger("uvicorn.access")
# Suppress duplicate uvicorn access logs since we have our own middleware
logger.setLevel(logging.WARNING)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request start
    console.print(f"[info]→ {request.method} {request.url.path}[/info]")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        status_code = response.status_code
        status_color = "success" if 200 <= status_code < 300 else "error" if status_code >= 400 else "warning"
        
        console.print(
            f"[{status_color}]← {status_code} {request.method} {request.url.path}[/{status_color}] "
            f"[dim]({process_time:.3f}s)[/dim]"
        )
        return response
    except Exception as e:
        process_time = time.time() - start_time
        console.print(f"[error]! {request.method} {request.url.path} Failed: {str(e)}[/error]")
        raise e

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    console.print(f"[error]Validation Error: {exc.errors()}[/error]")
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create media directories if they don't exist
os.makedirs(os.path.join(settings.MEDIA_ROOT, settings.RECEIPTS_DIR), exist_ok=True)

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(receipts.router, prefix="/receipts", tags=["receipts"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "ReceiptLens API", "version": "1.0.0"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

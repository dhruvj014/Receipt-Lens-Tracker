
from passlib.context import CryptContext
try:
    pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    hash = pwd_context.hash("test")
    print("SUCCESS: " + hash)
except Exception as e:
    print(f"FAILURE: {e}")

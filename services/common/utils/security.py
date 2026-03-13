from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
import secrets
import re

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token"""
    return secrets.token_urlsafe(length)


def is_strong_password(password: str) -> bool:
    """
    Check if password meets security requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    """
    if len(password) < 8:
        return False
    
    # Check for uppercase letters
    if not re.search(r'[A-Z]', password):
        return False
    
    # Check for lowercase letters
    if not re.search(r'[a-z]', password):
        return False
    
    # Check for digits
    if not re.search(r'\d', password):
        return False
    
    # Check for special characters
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]', password):
        return False
    
    return True


def is_valid_email(email: str) -> bool:
    """Validate email format using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def sanitize_input(input_string: str) -> str:
    """Sanitize user input to prevent XSS attacks"""
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', 'script', 'javascript']
    sanitized = input_string
    
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    
    return sanitized.strip()


def generate_session_token() -> str:
    """Generate a unique session token"""
    return generate_secure_token(64)


def calculate_token_expiry(hours: int = 24) -> datetime:
    """Calculate token expiry time"""
    return datetime.utcnow() + timedelta(hours=hours)


def mask_email(email: str) -> str:
    """Mask email for display purposes (e.g., user@example.com -> u***@example.com)"""
    if '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    
    if len(local) <= 2:
        masked_local = '*' * len(local)
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    
    return f"{masked_local}@{domain}"


def generate_api_key() -> str:
    """Generate a secure API key"""
    return f"aidos_{generate_secure_token(32)}"


def validate_api_key(api_key: str) -> bool:
    """Validate API key format"""
    return api_key.startswith("aidos_") and len(api_key) == 38

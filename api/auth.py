"""
SpendSense Operator Dashboard - Authentication & Authorization

JWT-based authentication with role-based access control (RBAC).

Features:
- JWT token generation and validation
- Password hashing with bcrypt
- Role-based permissions (junior, senior, admin)
- Login endpoint
- Token verification dependency

Usage:
    from auth import verify_token, require_permission
    
    @router.get("/protected")
    def protected_route(operator = Depends(verify_token)):
        return {"operator_id": operator["operator_id"]}
"""

from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# ========================================================================
# Configuration
# ========================================================================

# JWT Configuration - Load from environment variables
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production-min-32-chars-long-for-security")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))  # 8 hours default

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer security scheme
security = HTTPBearer()

# FastAPI router
router = APIRouter()


# ========================================================================
# Pydantic Models
# ========================================================================

class LoginRequest(BaseModel):
    """Login request payload"""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Login response payload"""
    access_token: str
    token_type: str
    operator: Dict[str, str]


class OperatorInfo(BaseModel):
    """Operator information"""
    operator_id: str
    name: str
    email: str
    role: str


# ========================================================================
# Operator Database (In-Memory)
# ========================================================================

# In production, this would be stored in a database
# Password hashes generated with: bcrypt.hashpw(password.encode(), bcrypt.gensalt())
OPERATORS = {
    "jane.doe@spendsense.com": {
        "operator_id": "op_001",
        "name": "Jane Doe",
        "email": "jane.doe@spendsense.com",
        "role": "senior",
        # Password: password123
        "password_hash": "$2b$12$mU1IZnuYsSYQLp5zub/hYO9spKBJAsmJ632Dj/tNe19iLwmqU3xh."
    },
    "john.smith@spendsense.com": {
        "operator_id": "op_002",
        "name": "John Smith",
        "email": "john.smith@spendsense.com",
        "role": "junior",
        # Password: password123
        "password_hash": "$2b$12$aVqAlM0qc8o9VGfCigGAGeHiiZ9.2n23hcZ4wEdFQCFZNCPUcB7LO"
    },
    "admin@spendsense.com": {
        "operator_id": "op_admin",
        "name": "Admin User",
        "email": "admin@spendsense.com",
        "role": "admin",
        # Password: admin123
        "password_hash": "$2b$12$IV/17GlVxmvnGoZKb8a15.qRV.Euz2due4z3sgAp5DkPELvTXQlq2"
    }
}


# ========================================================================
# Role-Based Access Control (RBAC)
# ========================================================================

ROLES = {
    'junior': [
        'view',           # View recommendations and data
        'approve',        # Approve recommendations
        'reject',         # Reject recommendations
    ],
    'senior': [
        'view',
        'approve',
        'reject',
        'modify',         # Modify recommendation fields
        'bulk_approve',   # Bulk approve multiple recommendations
        'flag',           # Flag recommendations for review
    ],
    'admin': ['*']        # All permissions
}


def has_permission(role: str, permission: str) -> bool:
    """
    Check if a role has a specific permission.
    
    Args:
        role: User role (junior, senior, admin)
        permission: Permission to check
        
    Returns:
        bool: True if role has permission, False otherwise
    """
    if role == 'admin':
        return True
    
    return permission in ROLES.get(role, [])


# ========================================================================
# Password Hashing Utilities
# ========================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Bcrypt hash
        
    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        str: Bcrypt hash
    """
    return pwd_context.hash(password)


# ========================================================================
# JWT Token Management
# ========================================================================

def create_access_token(data: Dict[str, str], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Payload data to encode in token
        expires_delta: Token expiration time (optional)
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, str]:
    """
    Decode and verify a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Dict: Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ========================================================================
# Authentication Dependencies
# ========================================================================

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, str]:
    """
    FastAPI dependency to verify JWT token and return operator info.
    
    Usage:
        @router.get("/protected")
        def protected_route(operator = Depends(verify_token)):
            return {"operator_id": operator["operator_id"]}
    
    Args:
        credentials: HTTP Bearer token from request header
        
    Returns:
        Dict: Operator information (operator_id, email, role)
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    # Extract operator info from token
    operator_id = payload.get("operator_id")
    email = payload.get("email")
    role = payload.get("role")
    
    if not operator_id or not email or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "operator_id": operator_id,
        "email": email,
        "role": role,
        "name": payload.get("name", "")
    }


def require_permission(permission: str):
    """
    Dependency factory to check if operator has a specific permission.
    
    Usage:
        @router.post("/admin-only", dependencies=[Depends(require_permission("admin"))])
        def admin_route():
            return {"message": "Admin access"}
    
    Args:
        permission: Required permission
        
    Returns:
        Dependency function that checks permission
        
    Raises:
        HTTPException: If operator doesn't have required permission
    """
    def permission_checker(operator = Depends(verify_token)):
        if not has_permission(operator["role"], permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}"
            )
        return operator
    
    return permission_checker


# ========================================================================
# Authentication Endpoints
# ========================================================================

@router.post("/login", response_model=LoginResponse, tags=["Authentication"])
def login(request: LoginRequest):
    """
    Authenticate operator and return JWT token.
    
    Request Body:
        - email: Operator email
        - password: Operator password
    
    Returns:
        - access_token: JWT token
        - token_type: "bearer"
        - operator: Operator information
    
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find operator by email
    operator = OPERATORS.get(request.email)
    
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(request.password, operator["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "operator_id": operator["operator_id"],
            "email": operator["email"],
            "role": operator["role"],
            "name": operator["name"]
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "operator": {
            "operator_id": operator["operator_id"],
            "name": operator["name"],
            "email": operator["email"],
            "role": operator["role"]
        }
    }


@router.get("/me", response_model=OperatorInfo, tags=["Authentication"])
def get_current_operator(operator = Depends(verify_token)):
    """
    Get current authenticated operator information.
    
    Requires valid JWT token in Authorization header.
    
    Returns:
        Operator information (operator_id, name, email, role)
    """
    return OperatorInfo(**operator)


@router.post("/logout", tags=["Authentication"])
def logout():
    """
    Logout endpoint (client-side token removal).
    
    Since JWT tokens are stateless, logout is handled client-side
    by removing the token from storage.
    
    Returns:
        Success message
    """
    return {"message": "Successfully logged out"}


# ========================================================================
# Utility Functions
# ========================================================================

def authenticate_operator(email: str, password: str) -> Optional[Dict[str, str]]:
    """
    Authenticate an operator by email and password.
    
    Args:
        email: Operator email
        password: Plain text password
        
    Returns:
        Dict: Operator info if valid, None otherwise
    """
    operator = OPERATORS.get(email)
    
    if not operator:
        return None
    
    if not verify_password(password, operator["password_hash"]):
        return None
    
    return operator


def get_operator_by_id(operator_id: str) -> Optional[Dict[str, str]]:
    """
    Get operator by operator_id.
    
    Args:
        operator_id: Operator ID
        
    Returns:
        Dict: Operator info if found, None otherwise
    """
    for operator in OPERATORS.values():
        if operator["operator_id"] == operator_id:
            return operator
    
    return None


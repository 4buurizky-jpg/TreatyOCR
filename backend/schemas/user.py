from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    role: str = "OCR Operator"

class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    role: str
    is_active: bool = True
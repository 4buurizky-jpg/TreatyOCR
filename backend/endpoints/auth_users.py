import json
import os
import hashlib
import secrets
from typing import List
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/v1", tags=["Authentication & Users"])

USERS_FILE = "users_db.json"

# --- Skema Validasi ---
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

# --- Helper Penyimpanan JSON Lokal ---
def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def _load_users() -> list:
    if not os.path.exists(USERS_FILE):
        default_users = [
            {
                "id": 1,
                "full_name": "Administrator IndonesiaRe",
                "username": "admin",
                "email": "admin@indonesia-re.co.id",
                "password_hash": _hash_password("admin123"),
                "role": "Admin",
                "is_active": True,
            },
            {
                "id": 2,
                "full_name": "Abu Rizki",
                "username": "aburizki",
                "email": "abu@starcore.co.id",
                "password_hash": _hash_password("abu123"),
                "role": "OCR Operator",
                "is_active": True,
            },
        ]
        _save_users(default_users)
        return default_users
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_users(users: list):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

# --- Endpoint Login ---
@router.post("/auth/login")
def login(payload: LoginRequest, response: Response):
    users = _load_users()
    hashed_input = _hash_password(payload.password)

    matched_user = next(
        (
            u for u in users
            if u["username"] == payload.username
            and u["password_hash"] == hashed_input
            and u.get("is_active", True)
        ),
        None,
    )

    if not matched_user:
        raise HTTPException(status_code=401, detail="Username atau password salah.")

    session_token = secrets.token_hex(32)
    response.set_cookie(
        key="access_token",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=18000,
    )

    return {
        "message": "Login berhasil",
        "user": {
            "id": matched_user["id"],
            "full_name": matched_user["full_name"],
            "username": matched_user["username"],
            "email": matched_user["email"],
            "role": matched_user["role"],
        },
    }

# --- Endpoint Manajemen Pengguna (CRUD) ---
@router.get("/users", response_model=List[UserResponse])
def get_users():
    users = _load_users()
    return [{k: v for k, v in u.items() if k != "password_hash"} for u in users]

@router.post("/users", response_model=UserResponse)
def create_user(payload: UserCreate):
    users = _load_users()
    if any(u["username"] == payload.username for u in users):
        raise HTTPException(status_code=400, detail="Username sudah digunakan.")

    new_id = max((u["id"] for u in users), default=0) + 1
    new_user = {
        "id": new_id,
        "full_name": payload.full_name,
        "username": payload.username,
        "email": payload.email,
        "password_hash": _hash_password(payload.password),
        "role": payload.role,
        "is_active": True,
    }
    users.append(new_user)
    _save_users(users)
    return {k: v for k, v in new_user.items() if k != "password_hash"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    users = _load_users()
    updated_users = [u for u in users if u["id"] != user_id]
    if len(updated_users) == len(users):
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan.")
    _save_users(updated_users)
    return {"message": "Akun berhasil dihapus"}
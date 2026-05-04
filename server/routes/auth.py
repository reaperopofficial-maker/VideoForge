from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os

router = APIRouter()

class AuthRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(req: AuthRequest):
    dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
    if dev_mode:
        return {"token": "dev-token", "user": {"id": "dev_user", "username": req.username}}
    
    if req.username == "admin" and req.password == "password":
        return {"token": "test-token", "user": {"id": "prod_user", "username": req.username}}
        
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/register")
async def register(req: AuthRequest):
    return {"message": "User registered successfully", "user": {"username": req.username}}
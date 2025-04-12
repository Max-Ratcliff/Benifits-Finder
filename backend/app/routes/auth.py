# app/routes/auth.py
from fastapi import APIRouter, Body, HTTPException
from app.config import db
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/register")
async def register_user(
    email: str = Body(...),
    name: str = Body(...),
):
    # Now the request body is automatically captured and documented.
    if not email or not name:
        raise HTTPException(status_code=400, detail="Missing required fields")

    user_id = str(uuid.uuid4())

    try:
        user_ref = db.collection("users").document(user_id)
        user_ref.set({
            "email": email,
            "name": name,
            "created_at": datetime.utcnow(),
        })
        return {"message": "User registered successfully", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

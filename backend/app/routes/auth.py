# app/routes/auth.py
from fastapi import APIRouter, HTTPException, Request
from app.config import db
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/register")
async def register_user(request: Request):
    data = await request.json()
    # Example: Expecting fields like "email", "name", and maybe "password"
    if "email" not in data or "name" not in data:
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Generate a unique user ID
    user_id = str(uuid.uuid4())

    # Example: Save user data to a Firestore collection called "users"
    try:
        user_ref = db.collection("users").document(user_id)
        user_ref.set({
            "email": data["email"],
            "name": data["name"],
            "created_at": datetime.utcnow(),
            # Optionally add more fields as needed
        })
        return {"message": "User registered successfully", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# app/routes/auth.py
from fastapi import APIRouter, Body, HTTPException
from app.config import db  # Firestore reference (if needed for other endpoints)
from datetime import datetime
import uuid
from firebase_admin import auth as fb_auth  # Import Firebase Admin's auth module

router = APIRouter()


@router.post("/register")
async def register_user(
    email: str = Body(...),
    fname: str = Body(...),
    lname: str = Body(...),
    password: str = Body(...),
):
    # Registration using Firestore (for additional user details)
    if not email or not fname or not lname:
        raise HTTPException(status_code=400, detail="Missing required fields")

    user_id = str(uuid.uuid4())

    try:
        user_ref = db.collection("users").document(user_id)
        user_ref.set({
            "email": email,
            "first_name": fname,
            "last_name": lname,
            "created_at": datetime.utcnow(),
        })
        return {"message": "User registered successfully", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login-firebase")
async def login_with_firebase(
    id_token: str = Body(..., embed=True)
):
    """
    Login using Firebase Authentication.
    The client should send the Firebase ID token obtained after authentication.
    """
    try:
        # Verify the provided ID token using Firebase Admin SDK
        decoded_token = fb_auth.verify_id_token(id_token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")

        # Optionally, you can fetch additional user profile data from Firestore
        # if you have additional data stored (but that's separate from auth).
        return {"message": "Login successful", "user": {"uid": uid, "email": email}}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token"+str(e))

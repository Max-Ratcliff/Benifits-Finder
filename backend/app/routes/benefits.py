# ex
from fastapi import APIRouter, HTTPException
from app.config import db

router = APIRouter()


@router.get("/benefits")
async def get_benefits():
    try:
        # Example: read a "benefits" collection
        benefits_ref = db.collection("benefits")
        docs = benefits_ref.stream()
        all_benefits = [doc.to_dict() for doc in docs]
        return {"benefits": all_benefits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

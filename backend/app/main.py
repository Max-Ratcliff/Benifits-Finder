from fastapi import FastAPI
from app.routes import auth
# from app import config

# Create a FastAPI app instance
app = FastAPI(
    title="BenefitFinder API",
    description="Backend for BenefitFinder to determine eligible benefits and assist users",
    version="0.1.0",
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])


# Root endpoint to verify service status
@app.get("/")
def read_root():
    return {"message": "Welcome to BenefitFinder API"}

import os
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

# Configuration variables
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-default-secret-key")
API_KEY = os.getenv("GEMINI_API_KEY")  # Example from your .env

# Other configurations can go here

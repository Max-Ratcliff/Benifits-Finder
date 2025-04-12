import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv


# Load variables from .env
load_dotenv()

# Configuration variables
API_KEY = os.getenv("GEMINI_API_KEY")  # Example from your .env

# Get the path to your service account key from the environment
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_cred_path:
    raise ValueError("FIREBASE_CREDENTIALS must be set in your .env file")

# Initialize the Firebase Admin SDK
cred = credentials.Certificate(firebase_cred_path)
firebase_admin.initialize_app(cred)

# Create a Firestore client instance
db = firestore.client()

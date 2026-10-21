import os
from dotenv import load_dotenv

# Load .env file
base_dir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(base_dir, ".env"))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-fallback-secret-key-998877")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(base_dir, 'fake_job_detection.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@fakejobdetector.com")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "AdminPassword123!")

    CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "http://localhost:5173")
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS

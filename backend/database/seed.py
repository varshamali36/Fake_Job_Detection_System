import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask
from config import Config
from database.db import db
from models.user import User
from models.job_posting import JobPosting
from models.prediction import Prediction

def seed_db(app=None):
    if app is None:
        app = Flask(__name__)
        app.config.from_object(Config)
        db.init_app(app)

    with app.app_context():
        # Create all tables
        db.create_all()
        print("[INFO] Database tables created successfully.")

        # Bootstrap admin account idempotently
        admin_username = Config.ADMIN_USERNAME
        admin_email = Config.ADMIN_EMAIL
        admin_password = Config.ADMIN_PASSWORD

        existing_admin = User.query.filter((User.username == admin_username) | (User.email == admin_email)).first()

        if not existing_admin:
            admin_user = User(
                username=admin_username,
                email=admin_email,
                role='admin'
            )
            admin_user.set_password(admin_password)
            db.session.add(admin_user)
            db.session.commit()
            print(f"[SUCCESS] Admin account created: Username='{admin_username}', Email='{admin_email}'")
        else:
            print(f"[INFO] Admin account already exists (ID: {existing_admin.id}). Skipping admin creation.")

if __name__ == "__main__":
    seed_db()

import re
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from database.db import db
from models.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))

    # Validation
    if not username or len(username) < 3 or len(username) > 50:
        return jsonify({"error": "Username must be between 3 and 50 characters long."}), 400

    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    if not password or len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400

    # Duplicate check
    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        return jsonify({"error": "A user with this username already exists."}), 409

    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({"error": "A user with this email address already exists."}), 409

    # Create User
    new_user = User(username=username, email=email, role='user')
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    # Automatically log user in upon registration
    login_user(new_user)

    return jsonify({
        "message": "User registered successfully.",
        "user": new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    identifier = str(data.get('username', '') or data.get('email', '')).strip()
    password = str(data.get('password', ''))

    if not identifier or not password:
        return jsonify({"error": "Please provide your username/email and password."}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier.lower())).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username/email or password."}), 401

    login_user(user)

    return jsonify({
        "message": "Logged in successfully.",
        "user": user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully."}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            "authenticated": True,
            "user": current_user.to_dict()
        }), 200
    return jsonify({
        "authenticated": False,
        "user": None
    }), 200

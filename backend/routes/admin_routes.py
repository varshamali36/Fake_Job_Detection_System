import os
import io
import csv
import pandas as pd
from functools import wraps
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from database.db import db
from models.user import User
from models.prediction import Prediction
from models.job_posting import JobPosting

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Forbidden: Admin access required."}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    """
    Returns system-wide aggregate statistics across all users.
    """
    total_users = User.query.count()
    total_jobs = Prediction.query.count()
    total_suspicious = Prediction.query.filter_by(prediction='Suspicious').count()
    total_genuine = Prediction.query.filter_by(prediction='Genuine').count()

    # 5 most recent registered users
    recent_users = [u.to_dict() for u in User.query.order_by(User.created_at.desc()).limit(5).all()]

    # System-wide recent predictions
    all_preds_query = db.session.query(Prediction, JobPosting, User).join(
        JobPosting, Prediction.job_id == JobPosting.id
    ).join(
        User, Prediction.user_id == User.id
    ).order_by(Prediction.created_at.desc()).limit(20).all()

    all_preds = []
    for pred, job, user in all_preds_query:
        p_dict = pred.to_dict()
        p_dict['job_title'] = job.title
        p_dict['username'] = user.username
        p_dict['user_email'] = user.email
        all_preds.append(p_dict)

    return jsonify({
        "total_users": total_users,
        "total_jobs": total_jobs,
        "total_suspicious": total_suspicious,
        "total_genuine": total_genuine,
        "recent_users": recent_users,
        "all_predictions": all_preds
    }), 200

@admin_bp.route('/predictions/<int:pred_id>', methods=['DELETE'])
@admin_required
def delete_any_prediction(pred_id: int):
    """
    Allows admins to delete any prediction record and associated job posting.
    """
    pred = db.session.get(Prediction, pred_id)

    if not pred:
        return jsonify({"error": "Prediction record not found."}), 404

    job = db.session.get(JobPosting, pred.job_id)

    db.session.delete(pred)
    if job:
        db.session.delete(job)

    db.session.commit()
    return jsonify({"message": f"Admin deleted prediction record #{pred_id} successfully."}), 200

@admin_bp.route('/upload-dataset', methods=['POST'])
@admin_required
def upload_dataset():
    """
    Dataset CSV uploader validating schema requirements & fraudulent column values.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded in request."}), 400

    file = request.files['file']

    if not file or not file.filename:
        return jsonify({"error": "No file selected for upload."}), 400

    if not file.filename.lower().endswith('.csv'):
        return jsonify({"error": "Invalid file type. Only CSV files (.csv) are allowed."}), 400

    # Read CSV into memory/stream
    try:
        content = file.read()
        if len(content) > 50 * 1024 * 1024:
            return jsonify({"error": "File size exceeds the 50MB maximum limit."}), 400

        df = pd.read_csv(io.BytesIO(content))
    except Exception as err:
        return jsonify({"error": f"Failed to parse CSV file: {str(err)}"}), 400

    # Required columns validation
    REQUIRED_COLUMNS = [
        "title", "description", "fraudulent",
        "company_profile", "requirements", "benefits",
        "employment_type", "required_experience", "required_education",
        "industry", "function"
    ]

    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        return jsonify({
            "error": f"Required columns are missing: {', '.join(missing_cols)}"
        }), 400

    # Validate fraudulent column values
    unique_vals = df['fraudulent'].dropna().unique()
    valid_vals = {0, 1, '0', '1', 0.0, 1.0}
    if not set(unique_vals).issubset(valid_vals):
        return jsonify({
            "error": "Column 'fraudulent' must contain only 0 or 1 values."
        }), 400

    # Clean fraudulent column
    df['fraudulent'] = df['fraudulent'].astype(int)

    row_count = len(df)
    fraud_count = int((df['fraudulent'] == 1).sum())
    genuine_count = int((df['fraudulent'] == 0).sum())

    # Save to dataset/fake_job_postings.csv
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    target_path = os.path.join(base_dir, "dataset", "fake_job_postings.csv")
    os.makedirs(os.path.dirname(target_path), exist_ok=True)

    df.to_csv(target_path, index=False)

    return jsonify({
        "message": "Dataset uploaded successfully.",
        "filename": "fake_job_postings.csv",
        "row_count": row_count,
        "class_balance": {
            "genuine": genuine_count,
            "fraudulent": fraud_count
        },
        "retrain_command": "py -3 backend/ml/train_model.py"
    }), 200

import os
import json
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from database.db import db
from models.job_posting import JobPosting
from models.prediction import Prediction
from ml.predict import predict as ml_predict, ModelMissingError
from services.risk_service import evaluate_risk

predict_bp = Blueprint('predict', __name__, url_prefix='/api')

@predict_bp.route('/predict', methods=['POST'])
@login_required
def predict_job():
    data = request.get_json(silent=True) or {}

    title = str(data.get('title', '') or '').strip()
    description = str(data.get('description', '') or '').strip()

    if not title:
        return jsonify({"error": "Job Title is required and cannot be empty."}), 400

    if not description:
        return jsonify({"error": "Job Description is required and cannot be empty."}), 400

    # Extract all 13 fields
    job_fields = {
        "title": title,
        "company_profile": str(data.get('company_profile', '') or '').strip(),
        "description": description,
        "requirements": str(data.get('requirements', '') or '').strip(),
        "benefits": str(data.get('benefits', '') or '').strip(),
        "employment_type": str(data.get('employment_type', '') or '').strip(),
        "required_experience": str(data.get('required_experience', '') or '').strip(),
        "required_education": str(data.get('required_education', '') or '').strip(),
        "industry": str(data.get('industry', '') or '').strip(),
        "function": str(data.get('function', '') or '').strip(),
        "salary_range": str(data.get('salary_range', '') or '').strip(),
        "location": str(data.get('location', '') or '').strip(),
        "has_company_logo": bool(data.get('has_company_logo', False))
    }

    try:
        # Run ML model prediction
        ml_result = ml_predict(job_fields)
    except ModelMissingError as err:
        return jsonify({"error": str(err)}), 500
    except Exception as err:
        return jsonify({"error": f"Machine Learning prediction failed: {str(err)}"}), 500

    # Run rule-based risk scoring service
    risk_result = evaluate_risk(job_fields, ml_result)

    # 1. Create JobPosting row
    new_job = JobPosting(
        user_id=current_user.id,
        title=job_fields['title'],
        company_profile=job_fields['company_profile'],
        description=job_fields['description'],
        requirements=job_fields['requirements'],
        benefits=job_fields['benefits'],
        employment_type=job_fields['employment_type'],
        required_experience=job_fields['required_experience'],
        required_education=job_fields['required_education'],
        industry=job_fields['industry'],
        function=job_fields['function'],
        salary_range=job_fields['salary_range'],
        location=job_fields['location'],
        has_company_logo=job_fields['has_company_logo']
    )

    db.session.add(new_job)
    db.session.flush() # Populate new_job.id before commit

    # 2. Create Prediction row
    new_prediction = Prediction(
        job_id=new_job.id,
        user_id=current_user.id,
        prediction=ml_result['prediction'],
        confidence_score=ml_result['confidence_score'],
        risk_score=risk_result['risk_score'],
        risk_level=risk_result['risk_level'],
        risk_factors=risk_result['risk_factors'],
        positive_indicators=risk_result['positive_indicators']
    )

    db.session.add(new_prediction)
    db.session.commit()

    return jsonify({
        "message": "Job posting evaluated successfully.",
        "id": new_prediction.id,
        "job_id": new_job.id,
        "prediction": new_prediction.prediction,
        "confidence_score": new_prediction.confidence_score,
        "risk_score": new_prediction.risk_score,
        "risk_level": new_prediction.risk_level,
        "risk_factors": new_prediction.risk_factors,
        "positive_indicators": new_prediction.positive_indicators,
        "probabilities": ml_result['probabilities'],
        "job_details": new_job.to_dict(),
        "created_at": new_prediction.created_at.isoformat()
    }), 201

@predict_bp.route('/metrics', methods=['GET'])
def get_model_metrics():
    """
    Hard Rule 3: Returns evaluation metrics strictly read from ml/metrics.json
    """
    ml_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml"))
    metrics_path = os.path.join(ml_dir, "metrics.json")

    if not os.path.exists(metrics_path):
        return jsonify({"error": "Metrics file (ml/metrics.json) not found on server."}), 404

    try:
        with open(metrics_path, "r", encoding="utf-8") as f:
            metrics_data = json.load(f)
        return jsonify(metrics_data), 200
    except Exception as err:
        return jsonify({"error": "Failed to read metrics file."}), 500

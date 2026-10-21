from datetime import datetime, timedelta, timezone
from collections import Counter
from flask import Blueprint, jsonify
from flask_login import login_required, current_user

from database.db import db
from models.prediction import Prediction
from models.job_posting import JobPosting

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')

@dashboard_bp.route('/dashboard', methods=['GET'])
@login_required
def get_user_dashboard():
    """
    Returns user-specific analytics for dashboard charts and stat cards.
    """
    user_id = current_user.id

    # 1. User predictions & jobs query
    predictions = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
    total_analyzed = len(predictions)

    if total_analyzed == 0:
        return jsonify({
            "total_analyzed": 0,
            "genuine_count": 0,
            "fake_count": 0,
            "avg_risk_score": 0.0,
            "high_risk_count": 0,
            "recent_predictions": [],
            "risk_distribution": {"Low": 0, "Medium": 0, "High": 0},
            "predictions_over_time": [],
            "top_keywords": []
        }), 200

    genuine_count = sum(1 for p in predictions if p.prediction == 'Genuine')
    fake_count = sum(1 for p in predictions if p.prediction == 'Suspicious')
    avg_risk_score = round(sum(p.risk_score for p in predictions) / total_analyzed, 1)
    high_risk_count = sum(1 for p in predictions if p.risk_level == 'High')

    # Risk Distribution
    risk_distribution = {
        "Low": sum(1 for p in predictions if p.risk_level == 'Low'),
        "Medium": sum(1 for p in predictions if p.risk_level == 'Medium'),
        "High": sum(1 for p in predictions if p.risk_level == 'High')
    }

    # 10 Most Recent Predictions
    recent_preds = []
    for p in predictions[:10]:
        job = db.session.get(JobPosting, p.job_id)
        p_dict = p.to_dict()
        p_dict['job_title'] = job.title if job else 'Unknown Job'
        p_dict['company_profile'] = job.company_profile if job else ''
        recent_preds.append(p_dict)

    # Predictions Over Time (Last 30 Days)
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=30)
    
    # Initialize 30 day map
    daily_map = {}
    for i in range(30):
        day_str = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
        daily_map[day_str] = {"date": day_str, "total": 0, "genuine": 0, "fake": 0}

    for p in predictions:
        if p.created_at:
            p_date_str = p.created_at.strftime('%Y-%m-%d')
            if p_date_str in daily_map:
                daily_map[p_date_str]["total"] += 1
                if p.prediction == 'Genuine':
                    daily_map[p_date_str]["genuine"] += 1
                else:
                    daily_map[p_date_str]["fake"] += 1

    predictions_over_time = list(daily_map.values())

    # Top 10 Suspicious Keywords across user's flagged jobs
    keyword_counter = Counter()
    for p in predictions:
        if p.risk_factors:
            for rf in p.risk_factors:
                explanation = rf.get('explanation', '')
                if 'Found terms:' in explanation:
                    terms_part = explanation.split('Found terms:')[-1].strip('. ')
                    for term in terms_part.split(','):
                        clean_term = term.strip().lower()
                        if clean_term:
                            keyword_counter[clean_term] += 1
                elif 'factor' in rf:
                    keyword_counter[rf['factor']] += 1

    top_keywords = [{"keyword": kw, "count": cnt} for kw, cnt in keyword_counter.most_common(10)]

    return jsonify({
        "total_analyzed": total_analyzed,
        "genuine_count": genuine_count,
        "fake_count": fake_count,
        "avg_risk_score": avg_risk_score,
        "high_risk_count": high_risk_count,
        "recent_predictions": recent_preds,
        "risk_distribution": risk_distribution,
        "predictions_over_time": predictions_over_time,
        "top_keywords": top_keywords
    }), 200

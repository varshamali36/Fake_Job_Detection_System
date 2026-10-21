from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from database.db import db
from models.prediction import Prediction
from models.job_posting import JobPosting

history_bp = Blueprint('history', __name__, url_prefix='/api')

@history_bp.route('/history', methods=['GET'])
@login_required
def get_history():
    """
    Returns user's own prediction history with support for search, prediction filter,
    risk level filter, sorting, and pagination.
    """
    # Strict user scoping
    query = db.session.query(Prediction, JobPosting).join(
        JobPosting, Prediction.job_id == JobPosting.id
    ).filter(Prediction.user_id == current_user.id)

    # Search filter (title or company profile)
    search = request.args.get('search', '').strip()
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (JobPosting.title.ilike(search_pattern)) |
            (JobPosting.company_profile.ilike(search_pattern)) |
            (JobPosting.description.ilike(search_pattern))
        )

    # Prediction filter ('Genuine' | 'Suspicious')
    pred_filter = request.args.get('prediction', '').strip()
    if pred_filter and pred_filter.lower() in ['genuine', 'suspicious']:
        query = query.filter(Prediction.prediction.ilike(pred_filter))

    # Risk level filter ('Low' | 'Medium' | 'High')
    risk_filter = request.args.get('risk_level', '').strip()
    if risk_filter and risk_filter.lower() in ['low', 'medium', 'high']:
        query = query.filter(Prediction.risk_level.ilike(risk_filter))

    # Sorting
    sort_by = request.args.get('sort', 'newest').strip().lower()
    if sort_by == 'oldest':
        query = query.order_by(Prediction.created_at.asc())
    elif sort_by == 'risk_desc':
        query = query.order_by(Prediction.risk_score.desc())
    elif sort_by == 'risk_asc':
        query = query.order_by(Prediction.risk_score.asc())
    else: # default newest
        query = query.order_by(Prediction.created_at.desc())

    # Pagination
    try:
        page = max(int(request.args.get('page', 1)), 1)
    except ValueError:
        page = 1

    try:
        per_page = max(min(int(request.args.get('per_page', 10)), 100), 1)
    except ValueError:
        per_page = 10

    total_count = query.count()
    results = query.offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for pred, job in results:
        pred_dict = pred.to_dict()
        pred_dict['job_posting'] = job.to_dict()
        items.append(pred_dict)

    pages = (total_count + per_page - 1) // per_page if total_count > 0 else 1

    return jsonify({
        "items": items,
        "total": total_count,
        "page": page,
        "pages": pages,
        "per_page": per_page
    }), 200

@history_bp.route('/history/<int:pred_id>', methods=['GET'])
@login_required
def get_history_detail(pred_id: int):
    """
    Returns single history record. Scoped strictly to owner (403 Forbidden otherwise).
    """
    pred = db.session.get(Prediction, pred_id)

    if not pred:
        return jsonify({"error": "Prediction record not found."}), 404

    # Security Check: Scoped to owner
    if pred.user_id != current_user.id:
        return jsonify({"error": "Forbidden: You do not have permission to view this record."}), 403

    job = db.session.get(JobPosting, pred.job_id)

    res_dict = pred.to_dict()
    res_dict['job_posting'] = job.to_dict() if job else None

    return jsonify(res_dict), 200

@history_bp.route('/history/<int:pred_id>', methods=['DELETE'])
@login_required
def delete_history_entry(pred_id: int):
    """
    Deletes single history record and associated job posting. Scoped strictly to owner (403 Forbidden otherwise).
    """
    pred = db.session.get(Prediction, pred_id)

    if not pred:
        return jsonify({"error": "Prediction record not found."}), 404

    # Security Check: Scoped to owner
    if pred.user_id != current_user.id:
        return jsonify({"error": "Forbidden: You do not have permission to delete this record."}), 403

    job = db.session.get(JobPosting, pred.job_id)

    # Delete prediction and job posting
    db.session.delete(pred)
    if job:
        db.session.delete(job)

    db.session.commit()

    return jsonify({"message": "Prediction history entry deleted successfully."}), 200

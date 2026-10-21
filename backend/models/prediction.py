from datetime import datetime, timezone
from database.db import db

class Prediction(db.Model):
    __tablename__ = 'predictions'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job_postings.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)

    prediction = db.Column(db.String(50), nullable=False) # 'Genuine' | 'Suspicious'
    confidence_score = db.Column(db.Float, nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False) # 'Low' | 'Medium' | 'High'

    risk_factors = db.Column(db.JSON, nullable=False, default=list)
    positive_indicators = db.Column(db.JSON, nullable=False, default=list)

    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "job_id": self.job_id,
            "user_id": self.user_id,
            "prediction": self.prediction,
            "confidence_score": round(self.confidence_score, 2),
            "risk_score": round(self.risk_score, 2),
            "risk_level": self.risk_level,
            "risk_factors": self.risk_factors,
            "positive_indicators": self.positive_indicators,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

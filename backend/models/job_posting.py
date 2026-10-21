from datetime import datetime, timezone
from database.db import db

class JobPosting(db.Model):
    __tablename__ = 'job_postings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)

    # 13 form fields
    title = db.Column(db.String(255), nullable=False)
    company_profile = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=True)
    benefits = db.Column(db.Text, nullable=True)
    employment_type = db.Column(db.String(100), nullable=True)
    required_experience = db.Column(db.String(100), nullable=True)
    required_education = db.Column(db.String(100), nullable=True)
    industry = db.Column(db.String(150), nullable=True)
    function = db.Column(db.String(150), nullable=True)
    salary_range = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(150), nullable=True)
    has_company_logo = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    # Relationship to Prediction
    prediction = db.relationship('Prediction', backref='job_posting', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "company_profile": self.company_profile,
            "description": self.description,
            "requirements": self.requirements,
            "benefits": self.benefits,
            "employment_type": self.employment_type,
            "required_experience": self.required_experience,
            "required_education": self.required_education,
            "industry": self.industry,
            "function": self.function,
            "salary_range": self.salary_range,
            "location": self.location,
            "has_company_logo": self.has_company_logo,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

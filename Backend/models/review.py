from database import db
from datetime import datetime
import json

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    review_score = db.Column(db.Integer, nullable=True)
    summary = db.Column(db.Text, nullable=True)
    pylint_result = db.Column(db.Text, nullable=True)        # JSON string of pylint output
    security_result = db.Column(db.Text, nullable=True)      # JSON string of bandit output
    complexity_result = db.Column(db.Text, nullable=True)    # JSON string of radon complexity
    ai_analysis_result = db.Column(db.Text, nullable=True)   # JSON string of AI suggestions
    code_content = db.Column(db.Text, nullable=True)         # Combined code content of files
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    project = db.relationship('Project', backref=db.backref('reviews', lazy=True, cascade='all, delete-orphan'))

    def get_pylint(self):
        return json.loads(self.pylint_result) if self.pylint_result else []

    def get_security(self):
        return json.loads(self.security_result) if self.security_result else {}

    def get_complexity(self):
        return json.loads(self.complexity_result) if self.complexity_result else {}

    def get_ai_analysis(self):
        return json.loads(self.ai_analysis_result) if self.ai_analysis_result else {}

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "project_name": self.project.project_name if self.project else "",
            "upload_type": self.project.upload_type if self.project else "",
            "review_score": self.review_score,
            "summary": self.summary,
            "pylint_result": self.get_pylint(),
            "security_result": self.get_security(),
            "complexity_result": self.get_complexity(),
            "ai_analysis_result": self.get_ai_analysis(),
            "code_content": self.code_content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "findings": [f.to_dict() for f in self.findings]
        }


class ReviewFinding(db.Model):
    __tablename__ = 'review_findings'
    
    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey('reviews.id', ondelete='CASCADE'), nullable=False)
    severity = db.Column(db.String(50), nullable=False)  # 'HIGH', 'MEDIUM', 'LOW', 'INFO'
    issue = db.Column(db.String(255), nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    suggestion = db.Column(db.Text, nullable=True)
    file_name = db.Column(db.String(255), nullable=True)
    line_number = db.Column(db.Integer, nullable=True)

    # Relationships
    review = db.relationship('Review', backref=db.backref('findings', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            "id": self.id,
            "review_id": self.review_id,
            "severity": self.severity,
            "issue": self.issue,
            "explanation": self.explanation,
            "suggestion": self.suggestion,
            "file_name": self.file_name,
            "line_number": self.line_number
        }

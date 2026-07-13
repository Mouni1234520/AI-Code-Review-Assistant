from database import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    project_name = db.Column(db.String(150), nullable=False)
    upload_type = db.Column(db.String(50), nullable=False)  # 'file', 'snippet', 'github'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('projects', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "project_name": self.project_name,
            "upload_type": self.upload_type,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        # Import models here to register tables with SQLAlchemy metadata
        from models.user import User
        from models.project import Project
        from models.review import Review, ReviewFinding
        db.create_all()
        
        # Safe migration: add code_content column to reviews table if it doesn't exist
        try:
            db.session.execute(db.text("ALTER TABLE reviews ADD COLUMN code_content TEXT;"))
            db.session.commit()
        except Exception:
            db.session.rollback()

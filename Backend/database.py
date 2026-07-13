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

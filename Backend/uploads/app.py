from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import init_db
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize CORS & JWT
    CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization", "X-Gemini-API-Key"], "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})
    JWTManager(app)

    # Register Blueprints
    from routes.auth import auth_bp
    from routes.review import review_bp
    from routes.report import report_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(report_bp)

    # Initialize Database with SQLAlchemy
    init_db(app)

    @app.route("/")
    def home():
        return jsonify({
            "status": "online",
            "service": "AI Code Review Assistant API"
        }), 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(
        debug=True,
        use_reloader=False,
        port=5000
    )
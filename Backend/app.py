from flask import Flask
from flask_cors import CORS

try:
    from .routes.review import review_bp
except ImportError:
    from routes.review import review_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(review_bp)

@app.route("/")
def home():
    return "AI Code Review Assistant Running"


def main():
    app.run(debug=True, use_reloader=False)


if __name__ == "__main__":
    main()
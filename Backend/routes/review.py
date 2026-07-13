from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import json
from werkzeug.utils import secure_filename
from database import db
from models.project import Project
from models.review import Review, ReviewFinding
from services.pylint_service import analyze_pylint
from services.security_service import run_bandit
from services.complexity_service import analyze_complexity
from services.ai_service import run_ai_review

review_bp = Blueprint("review", __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {"py", "js"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@review_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_or_submit():
    user_id = get_jwt_identity()
    filepath = None
    filename = None
    upload_type = "file"
    code_content = ""

    # Check if this is a file upload or code snippet submission
    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Only .py and .js files are allowed"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        upload_type = "file"

        # Read content for AI service
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                code_content = f.read()
        except Exception:
            pass
    else:
        # Paste snippet payload
        data = request.get_json()
        if not data or "code" not in data:
            return jsonify({"error": "No file uploaded or code snippet received"}), 400
        
        code_content = data.get("code", "")
        lang = data.get("language", "python")
        ext = "js" if lang.lower() in ("js", "javascript") else "py"
        filename = data.get("filename", f"snippet.{ext}")
        
        filename = secure_filename(filename)
        if not filename.endswith(f".{ext}"):
            filename = f"{filename}.{ext}"

        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save code to file to run static analyzers
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code_content)
        upload_type = "snippet"

    # Read config keys
    api_key_header = request.headers.get("X-Gemini-API-Key")

    # Determine language
    is_python = filename.endswith(".py")

    # Stage 2: Static Code Analysis (Only for Python files)
    pylint_res = {"findings": [], "score": 100.0}
    bandit_res = {"results": []}
    complexity_res = {
        "complexity": [],
        "mi": {"score": 100.0, "rank": "A (High)"},
        "raw": {"loc": 0, "lloc": 0, "sloc": 0, "comments": 0, "multi": 0, "blank": 0},
        "stats": {"classes_count": 0, "functions_count": 0, "avg_complexity": 0, "avg_func_length": 0}
    }

    if is_python:
        pylint_res = analyze_pylint(filepath)
        bandit_res = run_bandit(filepath)
        complexity_res = analyze_complexity(filepath)
    else:
        # JS files mock static analysis to keep the API unified, count lines of code
        lines = code_content.splitlines()
        complexity_res["raw"]["loc"] = len(lines)
        complexity_res["raw"]["sloc"] = len([l for l in lines if l.strip()])
        complexity_res["mi"]["score"] = 90.0

    # Stage 3: AI Code Review
    ai_res = run_ai_review(code_content, filename, api_key_header)

    # Use AI score as primary if available, otherwise fallback to pylint
    review_score = 100.0
    if ai_res.get("enabled") and "score" in ai_res:
        review_score = ai_res["score"]
    elif is_python:
        review_score = pylint_res.get("score", 100.0)

    summary = ai_res.get("summary", "Analysis completed successfully.") if ai_res.get("enabled") else "Static analysis completed. Configure Gemini API key for detailed AI suggestions."

    try:
        # Save project and review in DB
        project = Project(user_id=int(user_id), project_name=filename, upload_type=upload_type)
        db.session.add(project)
        db.session.flush() # Populate project.id

        review = Review(
            project_id=project.id,
            review_score=int(review_score),
            summary=summary,
            pylint_result=json.dumps(pylint_res),
            security_result=json.dumps(bandit_res),
            complexity_result=json.dumps(complexity_res),
            ai_analysis_result=json.dumps(ai_res)
        )
        db.session.add(review)
        db.session.flush() # Populate review.id

        # Populate findings
        # 1. Pylint findings
        for f in pylint_res.get("findings", []):
            finding = ReviewFinding(
                review_id=review.id,
                severity="INFO" if f["type"] in ("convention", "refactor") else ("MEDIUM" if f["type"] == "warning" else "HIGH"),
                issue=f["symbol"],
                explanation=f["message"],
                suggestion=f"Refactoring recommended for line {f['line']}.",
                file_name=filename,
                line_number=f["line"]
            )
            db.session.add(finding)

        # 2. Bandit findings
        for f in bandit_res.get("results", []):
            finding = ReviewFinding(
                review_id=review.id,
                severity=f["severity"],
                issue=f["symbol"],
                explanation=f["message"],
                suggestion="Apply secure coding practices.",
                file_name=filename,
                line_number=f["line"]
            )
            db.session.add(finding)

        # 3. AI findings
        if ai_res.get("enabled") and "findings" in ai_res:
            for f in ai_res["findings"]:
                finding = ReviewFinding(
                    review_id=review.id,
                    severity=f.get("severity", "MEDIUM"),
                    issue=f.get("issue", "AI Finding"),
                    explanation=f.get("explanation", ""),
                    suggestion=f.get("suggestion", ""),
                    file_name=f.get("file_name", filename),
                    line_number=f.get("line_number")
                )
                db.session.add(finding)

        db.session.commit()

        # Build response
        return jsonify({
            "review_id": review.id,
            "filename": filename,
            "upload_type": upload_type,
            "score": review_score,
            "summary": summary,
            "pylint": pylint_res,
            "security": bandit_res,
            "complexity": complexity_res,
            "ai": ai_res
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@review_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    try:
        search = request.args.get("search", "")
        min_score = request.args.get("min_score", type=int)
        max_score = request.args.get("max_score", type=int)

        # Fetch projects belonging to this user
        query = db.session.query(Review).join(Project).filter(Project.user_id == int(user_id))

        if search:
            query = query.filter(Project.project_name.like(f"%{search}%"))

        if min_score is not None:
            query = query.filter(Review.review_score >= min_score)
        
        if max_score is not None:
            query = query.filter(Review.review_score <= max_score)

        reviews = query.order_by(Review.created_at.desc()).all()

        return jsonify([r.to_dict() for r in reviews]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@review_bp.route("/reviews/<int:review_id>", methods=["GET"])
@jwt_required()
def get_review(review_id):
    user_id = get_jwt_identity()
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404

        # Access check
        if review.project.user_id != int(user_id):
            return jsonify({"error": "Unauthorized access to this review"}), 403

        return jsonify(review.to_dict()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@review_bp.route("/reviews/<int:review_id>", methods=["DELETE"])
@jwt_required()
def delete_review(review_id):
    user_id = get_jwt_identity()
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404

        # Access check
        if review.project.user_id != int(user_id):
            return jsonify({"error": "Unauthorized"}), 403

        # Project is cascade deleted because review has a ForeignKey cascade delete or is cascade mapped
        project = review.project
        db.session.delete(project)
        db.session.commit()

        return jsonify({"message": "Review deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
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
from services.complexity_service import analyze_complexity, get_mi_rank
from services.ai_service import run_ai_review, run_ai_explain_and_fix

review_bp = Blueprint("review", __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {"py", "js", "java", "c", "cpp", "h"}

def parse_code_metrics(content, filename):
    lines = content.splitlines()
    loc = len(lines)
    sloc = 0
    comments = 0
    blanks = 0
    classes = 0
    functions = 0
    
    in_multiline_comment = False
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    for line in lines:
        line_strip = line.strip()
        
        # Blank lines
        if not line_strip:
            blanks += 1
            continue
            
        # Multiline comments check
        if in_multiline_comment:
            comments += 1
            if "*/" in line_strip:
                in_multiline_comment = False
            continue
            
        if line_strip.startswith("/*"):
            comments += 1
            if "*/" not in line_strip:
                in_multiline_comment = True
            continue
            
        # Singleline comments check
        if line_strip.startswith("//") or (ext == "py" and line_strip.startswith("#")):
            comments += 1
            continue
            
        sloc += 1
        
        # Count classes
        if ext in ("java", "js", "cpp"):
            if "class " in line_strip or "interface " in line_strip:
                classes += 1
                
        # Count functions
        if ext == "js":
            if "function " in line_strip or "=>" in line_strip:
                functions += 1
        elif ext in ("java", "c", "cpp", "h"):
            if "(" in line_strip and ")" in line_strip and ("{" in line_strip or line_strip.endswith(";")):
                if not any(k in line_strip for k in ("if", "for", "while", "switch", "catch", "else")):
                    functions += 1
                    
    return classes, functions, loc, sloc, comments, blanks

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@review_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_or_submit():
    user_id = get_jwt_identity()
    api_key_header = request.headers.get("X-Mistral-API-Key")

    # Check if multiple files were uploaded under the "file" key
    uploaded_files = request.files.getlist("file") if "file" in request.files else []
    # Filter out blank entries
    uploaded_files = [f for f in uploaded_files if f.filename != ""]

    upload_type = "file"
    project_name = ""
    code_content_combined = ""
    file_records = []

    if uploaded_files:
        upload_type = "file"
        project_name = ", ".join([f.filename for f in uploaded_files])

        # Save and prepare all uploaded files
        for file in uploaded_files:
            if not allowed_file(file.filename):
                return jsonify({"error": f"File '{file.filename}' type not allowed. Only .py, .js, .java, and .c files are supported."}), 400

            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)

            # Read code content
            content = ""
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                code_content_combined += f"\n\n# ==========================================\n# FILE: {filename}\n# ==========================================\n{content}\n"
            except Exception:
                pass

            file_records.append({
                "filepath": filepath,
                "filename": filename,
                "content": content
            })
    else:
        # Code snippet submission
        data = request.get_json()
        if not data or "code" not in data:
            return jsonify({"error": "No file uploaded or code snippet received"}), 400

        code_content = data.get("code", "")
        lang = data.get("language", "python").lower()
        if lang in ("js", "javascript"):
            ext = "js"
        elif lang == "java":
            ext = "java"
        elif lang in ("c", "cpp", "h"):
            ext = "c"
        else:
            ext = "py"
        filename = data.get("filename", f"snippet.{ext}")

        filename = secure_filename(filename)
        if not filename.endswith(f".{ext}"):
            filename = f"{filename}.{ext}"

        filepath = os.path.join(UPLOAD_FOLDER, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code_content)

        upload_type = "snippet"
        project_name = filename
        code_content_combined = code_content
        file_records.append({
            "filepath": filepath,
            "filename": filename,
            "content": code_content
        })

    # Combined results schemas
    pylint_res = {"findings": [], "score": 100.0}
    bandit_res = {"results": []}
    complexity_res = {
        "complexity": [],
        "mi": {"score": 100.0, "rank": "A (High)"},
        "raw": {"loc": 0, "lloc": 0, "sloc": 0, "comments": 0, "multi": 0, "blank": 0},
        "stats": {"classes_count": 0, "functions_count": 0, "avg_complexity": 0, "avg_func_length": 0}
    }

    pylint_scores = []
    mi_scores = []
    num_python = 0

    # Analyze each file
    for rec in file_records:
        fname = rec["filename"]
        fpath = rec["filepath"]
        is_python = fname.endswith(".py")

        if is_python:
            num_python += 1
            # 1. Pylint
            p_res = analyze_pylint(fpath)
            for f in p_res.get("findings", []):
                f["file_name"] = fname
            pylint_res["findings"].extend(p_res.get("findings", []))
            pylint_scores.append(p_res.get("score", 100.0))

            # 2. Bandit
            b_res = run_bandit(fpath)
            for f in b_res.get("results", []):
                f["file_name"] = fname
            bandit_res["results"].extend(b_res.get("results", []))

            # 3. Radon
            c_res = analyze_complexity(fpath)
            for block in c_res.get("complexity", []):
                block["file_name"] = fname
            complexity_res["complexity"].extend(c_res.get("complexity", []))

            # Accumulate raw metrics
            complexity_res["raw"]["loc"] += c_res.get("raw", {}).get("loc", 0)
            complexity_res["raw"]["lloc"] += c_res.get("raw", {}).get("lloc", 0)
            complexity_res["raw"]["sloc"] += c_res.get("raw", {}).get("sloc", 0)
            complexity_res["raw"]["comments"] += c_res.get("raw", {}).get("comments", 0)
            complexity_res["raw"]["multi"] += c_res.get("raw", {}).get("multi", 0)
            complexity_res["raw"]["blank"] += c_res.get("raw", {}).get("blank", 0)

            # Accumulate stats counts
            complexity_res["stats"]["classes_count"] += c_res.get("stats", {}).get("classes_count", 0)
            complexity_res["stats"]["functions_count"] += c_res.get("stats", {}).get("functions_count", 0)
            complexity_res["stats"]["avg_complexity"] += c_res.get("stats", {}).get("avg_complexity", 0)
            mi_scores.append(c_res.get("mi", {}).get("score", 100.0))
        else:
            # JS, Java, C, C++ files
            classes, funcs, loc, sloc, comments, blanks = parse_code_metrics(rec["content"], fname)
            
            complexity_res["raw"]["loc"] += loc
            complexity_res["raw"]["sloc"] += sloc
            complexity_res["raw"]["comments"] += comments
            complexity_res["raw"]["blank"] += blanks
            
            complexity_res["stats"]["classes_count"] += classes
            complexity_res["stats"]["functions_count"] += funcs
            mi_scores.append(90.0)

    # Compute averaged scores across all uploaded files
    if pylint_scores:
        pylint_res["score"] = round(sum(pylint_scores) / len(pylint_scores), 2)
    else:
        pylint_res["score"] = 100.0

    if mi_scores:
        avg_mi = round(sum(mi_scores) / len(mi_scores), 2)
        complexity_res["mi"]["score"] = avg_mi
        complexity_res["mi"]["rank"] = get_mi_rank(avg_mi)

    total_funcs = complexity_res["stats"]["functions_count"]
    total_sloc = complexity_res["raw"]["sloc"]
    
    if num_python > 0:
        complexity_res["stats"]["avg_complexity"] = round(complexity_res["stats"]["avg_complexity"] / num_python, 2)
    else:
        complexity_res["stats"]["avg_complexity"] = 2.5
        
    complexity_res["stats"]["avg_func_length"] = round(total_sloc / max(1, total_funcs), 1) if total_funcs > 0 else 0

    # Call Gemini model on the combined code
    ai_res = run_ai_review(code_content_combined, project_name, api_key_header)

    # Final unified score math
    review_score = 100.0
    if ai_res.get("enabled") and "score" in ai_res:
        review_score = ai_res["score"]
    else:
        review_score = pylint_res["score"]

    summary = ai_res.get("summary", "Analysis completed successfully.") if ai_res.get("enabled") else "Static analysis completed. Configure Mistral API key for detailed AI suggestions."

    try:
        # Save project and review in DB
        project = Project(user_id=int(user_id), project_name=project_name, upload_type=upload_type)
        db.session.add(project)
        db.session.flush()

        review = Review(
            project_id=project.id,
            review_score=int(review_score),
            summary=summary,
            pylint_result=json.dumps(pylint_res),
            security_result=json.dumps(bandit_res),
            complexity_result=json.dumps(complexity_res),
            ai_analysis_result=json.dumps(ai_res),
            code_content=code_content_combined
        )
        db.session.add(review)
        db.session.flush()

        # Save relational findings
        # 1. Pylint findings
        for f in pylint_res.get("findings", []):
            finding = ReviewFinding(
                review_id=review.id,
                severity="INFO" if f["type"] in ("convention", "refactor") else ("MEDIUM" if f["type"] == "warning" else "HIGH"),
                issue=f["symbol"],
                explanation=f["message"],
                suggestion=f"Refactoring recommended for line {f['line']}.",
                file_name=f.get("file_name", project_name),
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
                file_name=f.get("file_name", project_name),
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
                    file_name=f.get("file_name", project_name),
                    line_number=f.get("line_number")
                )
                db.session.add(finding)

        db.session.commit()

        # Return full payload
        return jsonify({
            "review_id": review.id,
            "filename": project_name,
            "upload_type": upload_type,
            "score": review_score,
            "summary": summary,
            "pylint": pylint_res,
            "security": bandit_res,
            "complexity": complexity_res,
            "ai": ai_res,
            "code": code_content_combined
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@review_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    try:
        user_id = get_jwt_identity()
        projects = Project.query.filter_by(user_id=int(user_id)).all()
        project_ids = [p.id for p in projects]
        reviews = Review.query.filter(Review.project_id.in_(project_ids)).order_by(Review.created_at.desc()).all()
        return jsonify([r.to_dict() for r in reviews]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@review_bp.route("/reviews/<int:review_id>", methods=["DELETE"])
@jwt_required()
def delete_review(review_id):
    try:
        user_id = get_jwt_identity()
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404
        if review.project.user_id != int(user_id):
            return jsonify({"error": "Unauthorized"}), 403
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@review_bp.route("/explain-and-fix", methods=["POST"])
@jwt_required()
def explain_and_fix():
    try:
        api_key_header = request.headers.get("X-Mistral-API-Key")
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        code = data.get("code")
        pylint = data.get("pylint")
        security = data.get("security")
        complexity = data.get("complexity")

        if not code:
            return jsonify({"error": "No code content provided"}), 400

        analysis_results = {
            "pylint": pylint,
            "security": security,
            "complexity": complexity
        }

        res = run_ai_explain_and_fix(code, analysis_results, api_key_header)
        if "error" in res:
            return jsonify(res), 500

        return jsonify(res), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
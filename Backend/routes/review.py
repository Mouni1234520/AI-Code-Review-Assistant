from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename

try:
    from ..services.pylint_service import analyze_python_file
except ImportError:
    from services.pylint_service import analyze_python_file

review_bp = Blueprint("review", __name__)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"py"}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@review_bp.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"message": "No file part in the request"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Only .py files are allowed"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        file.save(path)
        result = analyze_python_file(path)
    except Exception as exc:
        return jsonify({"message": "Upload failed", "error": str(exc)}), 500

    return jsonify({
        "message": "File uploaded successfully",
        "result": result
    })
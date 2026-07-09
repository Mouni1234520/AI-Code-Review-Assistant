from flask import Flask, request, jsonify
import os

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/")
def home():
    return "AI Code Review Assistant Backend Running!"


@app.route("/upload", methods=["POST"])
def upload_file():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    file.save(os.path.join(UPLOAD_FOLDER, file.filename))

    return jsonify({
        "message": "File uploaded successfully",
        "filename": file.filename
    })


if __name__ == "__main__":
    app.run(debug=True)
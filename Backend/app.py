from flask import Flask, request, jsonify
from analyzer import review_code

app = Flask(__name__)


@app.route("/")
def home():
    return "AI Code Review Assistant Backend Running!"


@app.route("/review", methods=["POST"])
def review():

    data = request.json

    code = data["code"]

    result = review_code(code)

    return jsonify({
        "review": result
    })


if __name__ == "__main__":
    app.run(debug=True)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models.user import User
import datetime

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        # Check if username exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400

        if email:
            existing_email = User.query.filter_by(email=email).first()
            if existing_email:
                return jsonify({"error": "Email already exists"}), 400

        # Create user
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.check_password(password):
            return jsonify({"error": "Invalid password"}), 401

        # Generate JWT token
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=datetime.timedelta(days=30)
        )

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user_id": user.id,
            "username": user.username,
            "email": user.email
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        email = data.get("email")
        password = data.get("password")
        new_password = data.get("new_password")

        if email:
            # Check if email is used by another user
            existing = User.query.filter_by(email=email).first()
            if existing and existing.id != user.id:
                return jsonify({"error": "Email is already taken"}), 400
            user.email = email

        if new_password:
            # Verify current password before resetting
            if not password:
                return jsonify({"error": "Current password is required to set a new password"}), 400
            if not user.check_password(password):
                return jsonify({"error": "Invalid current password"}), 401
            user.set_password(new_password)

        db.session.commit()
        return jsonify({"message": "Profile updated successfully", "user": user.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

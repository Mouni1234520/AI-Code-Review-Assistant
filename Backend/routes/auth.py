from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models.user import User
import datetime
from itsdangerous import URLSafeTimedSerializer
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

        if not username or not password or not email:
            return jsonify({"error": "Username, password, and email required"}), 400

        if not username.isalpha():
            return jsonify({"error": "Username must contain only alphabetic characters"}), 400

        # Check if username exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400

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
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return jsonify({"error": "Username, email, and password required"}), 400

        user = User.query.filter_by(username=username, email=email).first()
        if not user:
            return jsonify({"error": "User not found with specified username and email"}), 404

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


def send_reset_email(to_email, reset_url):
    mail_server = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    mail_port = int(os.environ.get("MAIL_PORT", "587"))
    mail_username = os.environ.get("MAIL_USERNAME", "")
    mail_password = os.environ.get("MAIL_PASSWORD", "")
    mail_sender = os.environ.get("MAIL_DEFAULT_SENDER", mail_username or "noreply@codereviewassistant.com")

    subject = "Password Reset Link - AI Code Review Assistant"
    body = f"""Hello,

You requested a password reset for your AI Code Review Assistant account.
Please click the link below to reset your password (valid for 15 minutes):

{reset_url}

If you did not request this reset, please ignore this email.
"""

    if not mail_username or not mail_password:
        print("\n=== [DEVELOPMENT ONLY] PASSWORD RESET EMAIL ===")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Link: {reset_url}")
        print("==============================================\n")
        return False, "SMTP credentials not configured. Reset link printed to backend console."

    try:
        msg = MIMEMultipart()
        msg['From'] = mail_sender
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(mail_server, mail_port)
        server.starttls()
        server.login(mail_username, mail_password)
        server.sendmail(mail_sender, to_email, msg.as_string())
        server.close()
        return True, "Email sent successfully."
    except Exception as e:
        print(f"Error sending email: {e}")
        return False, str(e)


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        if not data or "email" not in data:
            return jsonify({"error": "Email is required"}), 400
        
        email = data.get("email")
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User with specified email not found"}), 404
        
        serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        token = serializer.dumps(email, salt="password-reset-salt")
        reset_url = f"http://localhost:5173/reset-password?token={token}"
        
        sent, message = send_reset_email(email, reset_url)
        
        response_data = {
            "message": "Password reset email sent." if sent else "Reset link generated (SMTP not configured)."
        }
        if not sent:
            response_data["dev_reset_link"] = reset_url
            
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        if not data or "token" not in data or "password" not in data:
            return jsonify({"error": "Token and password required"}), 400
        
        token = data.get("token")
        password = data.get("password")
        
        serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        try:
            email = serializer.loads(token, salt="password-reset-salt", max_age=900)
        except Exception:
            return jsonify({"error": "Invalid or expired reset token"}), 400
            
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User associated with this token not found"}), 404
            
        user.set_password(password)
        db.session.commit()
        
        return jsonify({"message": "Password has been reset successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from database import get_connection
import datetime
import sqlite3

def register_user(username, password):
    """Register a new user with hashed password"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Hash password
        hashed_password = generate_password_hash(password)
        
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, hashed_password)
        )
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "User registered successfully"}
    
    except sqlite3.IntegrityError:
        return {"success": False, "message": "Username already exists"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def login_user(username, password):
    """Authenticate user and return JWT token"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, password FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return {"success": False, "message": "User not found"}
        
        if not check_password_hash(user['password'], password):
            return {"success": False, "message": "Invalid password"}
        
        # Generate JWT token
        access_token = create_access_token(
            identity=user['id'],
            expires_delta=datetime.timedelta(days=30)
        )
        
        return {
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "user_id": user['id'],
            "username": username
        }
    
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_user_by_id(user_id):
    """Get user information by ID"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, username, created_at FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return dict(user)
        return None
    except Exception as e:
        return None

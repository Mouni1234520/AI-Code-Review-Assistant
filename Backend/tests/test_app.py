import os
import json
import tempfile
import unittest
from io import BytesIO
from unittest.mock import patch

from app import app
from database import db
from models.user import User

class AppTest(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.client = app.test_client()
        
        with app.app_context():
            db.create_all()
            
            # Create a test user for auth tests
            self.test_user = User(username="TestUser", email="test@example.com")
            self.test_user.set_password("password123")
            db.session.add(self.test_user)
            db.session.commit()
            
            # Retrieve user ID to keep track
            self.test_user_id = self.test_user.id

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_home_route(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "online")
        self.assertEqual(data.get("service"), "AI Code Review Assistant API")

    def test_upload_route_unauthorized(self):
        data = {
            "file": (BytesIO(b"print('hello')\n"), "sample.py")
        }
        response = self.client.post("/upload", data=data, content_type="multipart/form-data")
        self.assertEqual(response.status_code, 401)

    @patch("routes.review.analyze_pylint")
    @patch("routes.review.run_bandit")
    @patch("routes.review.analyze_complexity")
    @patch("routes.review.run_ai_review")
    def test_upload_route_authorized_success(self, mock_ai, mock_complexity, mock_bandit, mock_pylint):
        # Setup mocks
        mock_pylint.return_value = {
            "findings": [{"line": 1, "column": 0, "message": "Missing docstring", "symbol": "missing-docstring", "type": "convention"}],
            "score": 9.0
        }
        mock_bandit.return_value = {
            "results": []
        }
        mock_complexity.return_value = {
            "complexity": [],
            "mi": {"score": 100.0, "rank": "A (High)"},
            "raw": {"loc": 1, "lloc": 1, "sloc": 1, "comments": 0, "multi": 0, "blank": 0},
            "stats": {"classes_count": 0, "functions_count": 0, "avg_complexity": 0, "avg_func_length": 0}
        }
        mock_ai.return_value = {
            "enabled": True,
            "score": 95,
            "summary": "Mock summary",
            "findings": [],
            "bugs": [],
            "optimizations": [],
            "refactoring": []
        }

        # 1. Login to get access token
        login_response = self.client.post("/login", json={
            "username": "TestUser",
            "email": "test@example.com",
            "password": "password123"
        })
        self.assertEqual(login_response.status_code, 200)
        token = login_response.get_json()["access_token"]

        # 2. Upload file with token
        data = {
            "file": (BytesIO(b"print('hello')\n"), "sample.py")
        }
        headers = {
            "Authorization": f"Bearer {token}"
        }
        # In Werkzeug/Flask test client, multipart data is passed under 'data' and content_type is 'multipart/form-data'
        response = self.client.post("/upload", data=data, content_type="multipart/form-data", headers=headers)
        
        self.assertEqual(response.status_code, 201)
        res_json = response.get_json()
        self.assertEqual(res_json["filename"], "sample.py")
        self.assertEqual(res_json["score"], 95)
        self.assertEqual(res_json["summary"], "Mock summary")
        self.assertEqual(res_json["upload_type"], "file")

    @patch("routes.review.analyze_pylint")
    @patch("routes.review.run_bandit")
    @patch("routes.review.analyze_complexity")
    @patch("routes.review.run_ai_review")
    def test_export_markdown_route(self, mock_ai, mock_complexity, mock_bandit, mock_pylint):
        # Setup mocks
        mock_pylint.return_value = {"findings": [], "score": 10.0}
        mock_bandit.return_value = {"results": []}
        mock_complexity.return_value = {
            "complexity": [],
            "mi": {"score": 100.0, "rank": "A"},
            "raw": {"loc": 1},
            "stats": {}
        }
        mock_ai.return_value = {
            "enabled": True,
            "score": 95,
            "summary": "Mock summary",
            "findings": [],
            "bugs": [],
            "optimizations": [],
            "refactoring": []
        }

        # Login
        login_response = self.client.post("/login", json={
            "username": "TestUser",
            "email": "test@example.com",
            "password": "password123"
        })
        token = login_response.get_json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Upload snippet
        snippet_data = {
            "code": "print('hello')",
            "language": "python",
            "filename": "hello.py"
        }
        upload_resp = self.client.post("/upload", json=snippet_data, headers=headers)
        self.assertEqual(upload_resp.status_code, 201)
        review_id = upload_resp.get_json()["review_id"]

        # Export Markdown
        export_resp = self.client.get(f"/reviews/{review_id}/export/markdown", headers=headers)
        self.assertEqual(export_resp.status_code, 200)
        export_json = export_resp.get_json()
        self.assertIn("markdown", export_json)
        self.assertIn("AI Code Review Report", export_json["markdown"])

    @patch("routes.review.analyze_pylint")
    @patch("routes.review.run_bandit")
    @patch("routes.review.analyze_complexity")
    @patch("routes.review.run_ai_review")
    def test_history_and_delete_review(self, mock_ai, mock_complexity, mock_bandit, mock_pylint):
        # Setup mocks
        mock_pylint.return_value = {"findings": [], "score": 10.0}
        mock_bandit.return_value = {"results": []}
        mock_complexity.return_value = {
            "complexity": [],
            "mi": {"score": 100.0, "rank": "A"},
            "raw": {"loc": 1},
            "stats": {}
        }
        mock_ai.return_value = {"enabled": False}

        # Login
        login_response = self.client.post("/login", json={
            "username": "TestUser",
            "email": "test@example.com",
            "password": "password123"
        })
        token = login_response.get_json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Upload snippet
        snippet_data = {
            "code": "print('hello')",
            "language": "python",
            "filename": "hello.py"
        }
        upload_resp = self.client.post("/upload", json=snippet_data, headers=headers)
        self.assertEqual(upload_resp.status_code, 201)
        review_id = upload_resp.get_json()["review_id"]

        # Fetch history
        history_resp = self.client.get("/history", headers=headers)
        self.assertEqual(history_resp.status_code, 200)
        history_data = history_resp.get_json()
        self.assertEqual(len(history_data), 1)
        self.assertEqual(history_data[0]["id"], review_id)

        # Delete review
        delete_resp = self.client.delete(f"/reviews/{review_id}", headers=headers)
        self.assertEqual(delete_resp.status_code, 200)

        # Fetch history again (should be empty)
        history_resp2 = self.client.get("/history", headers=headers)
        self.assertEqual(history_resp2.status_code, 200)
        self.assertEqual(len(history_resp2.get_json()), 0)

if __name__ == "__main__":
    unittest.main()

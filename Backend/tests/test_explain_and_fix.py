import unittest
from unittest.mock import patch
from app import app
from database import db
from models.user import User

class ExplainAndFixTest(unittest.TestCase):
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
            
            # Login to get token
            login_response = self.client.post("/login", json={
                "username": "TestUser",
                "email": "test@example.com",
                "password": "password123"
            })
            self.token = login_response.get_json()["access_token"]

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    @patch("routes.review.run_ai_explain_and_fix")
    def test_explain_and_fix_success(self, mock_explain_and_fix):
        mock_explain_and_fix.return_value = {
            "summary": "This is a clean code snippet.",
            "explanations": [],
            "best_practices": [],
            "security_recommendations": [],
            "estimated_quality_after": "Est. Score: 100/100"
        }

        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        response = self.client.post(
            "/explain-and-fix",
            json={
                "code": "def hello(): pass",
                "pylint": {},
                "security": {},
                "complexity": {}
            },
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        res_json = response.get_json()
        self.assertEqual(res_json["summary"], "This is a clean code snippet.")
        self.assertEqual(res_json["estimated_quality_after"], "Est. Score: 100/100")

    def test_explain_and_fix_unauthorized(self):
        response = self.client.post(
            "/explain-and-fix",
            json={
                "code": "def hello(): pass"
            }
        )
        self.assertEqual(response.status_code, 401)

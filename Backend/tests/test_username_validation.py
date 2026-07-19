import unittest
from app import app
from database import db
from models.user import User

class UsernameValidationTest(unittest.TestCase):
    def setUp(self):
        # Configure app to use testing configuration or in-memory SQLite database
        app.config["TESTING"] = True
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.client = app.test_client()
        
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register_with_alphabetic_username_succeeds(self):
        # Username with only letters
        response = self.client.post("/register", json={
            "username": "Alice",
            "email": "alice@example.com",
            "password": "securepassword123"
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn(b"registered successfully", response.data)

    def test_register_with_numbers_fails(self):
        # Username containing numbers
        response = self.client.post("/register", json={
            "username": "Alice123",
            "email": "alice@example.com",
            "password": "securepassword123"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"Username must contain only alphabetic characters", response.data)

    def test_register_with_spaces_fails(self):
        # Username containing spaces
        response = self.client.post("/register", json={
            "username": "Alice Smith",
            "email": "alice@example.com",
            "password": "securepassword123"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"Username must contain only alphabetic characters", response.data)

    def test_register_with_special_characters_fails(self):
        # Username containing special characters
        response = self.client.post("/register", json={
            "username": "Alice_Bob",
            "email": "alice@example.com",
            "password": "securepassword123"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"Username must contain only alphabetic characters", response.data)

if __name__ == "__main__":
    unittest.main()

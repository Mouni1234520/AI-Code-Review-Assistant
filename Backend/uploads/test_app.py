import os
import tempfile
from io import BytesIO
from unittest import TestCase
from unittest.mock import patch

import app as app_module
from app import app
import routes.review as review_module


class AppTest(TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_home_route(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"AI Code Review Assistant Running", response.data)

    def test_main_uses_reloader_disabled(self):
        with patch.object(app_module.app, "run") as run_mock:
            app_module.main()

        run_mock.assert_called_once_with(debug=True, use_reloader=False)

    def test_upload_route(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(review_module, "UPLOAD_FOLDER", tmpdir):
                with patch.object(review_module, "analyze_python_file", return_value=[{"message": "ok"}]):
                    data = {
                        "file": (BytesIO(b"print('hello')\n"), "sample.py")
                    }
                    response = self.client.post("/upload", data=data, content_type="multipart/form-data")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "File uploaded successfully")
        self.assertEqual(response.json["result"], [{"message": "ok"}])

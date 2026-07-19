import unittest
from unittest.mock import patch, MagicMock
import json
import urllib.error

from services.ai_service import run_ai_review

class AiServiceTest(unittest.TestCase):
    @patch("urllib.request.urlopen")
    @patch("urllib.request.Request")
    def test_run_ai_review_success(self, mock_request_class, mock_urlopen):
        # Setup mock response
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": json.dumps({
                            "score": 90,
                            "summary": "Excellent code quality.",
                            "findings": [],
                            "bugs": [],
                            "optimizations": [],
                            "refactoring": []
                        })
                    }
                }
            ]
        }).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = mock_response

        # Execute
        result = run_ai_review("print('hello')", "test.py", api_key="dummy_mistral_key")

        # Assertions
        self.assertTrue(result["enabled"])
        self.assertEqual(result["score"], 90)
        self.assertEqual(result["summary"], "Excellent code quality.")
        
        # Verify Request call args
        mock_request_class.assert_called_once()
        args, kwargs = mock_request_class.call_args
        self.assertEqual(args[0], "https://api.mistral.ai/v1/chat/completions")
        self.assertEqual(kwargs["method"], "POST")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer dummy_mistral_key")
        self.assertEqual(kwargs["headers"]["Content-Type"], "application/json")

    @patch.dict("os.environ", {}, clear=True)
    def test_run_ai_review_no_api_key(self):
        # Execute without API key
        result = run_ai_review("print('hello')", "test.py", api_key=None)
        self.assertFalse(result["enabled"])
        self.assertIn("AI analysis skipped", result["message"])

if __name__ == "__main__":
    unittest.main()

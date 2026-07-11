import os
import subprocess
import unittest
from unittest.mock import patch

from services.pylint_service import analyze_python_file


class PylintServiceTest(unittest.TestCase):
    def test_analyze_python_file_sets_project_root_on_subprocess(self):
        class DummyResult:
            stdout = "[]"
            stderr = ""

        with patch("services.pylint_service.subprocess.run", return_value=DummyResult()) as run_mock:
            analyze_python_file("uploads/sample.py")

        self.assertEqual(run_mock.call_args.kwargs["cwd"], os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
        self.assertIn(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")), run_mock.call_args.kwargs["env"]["PYTHONPATH"].split(os.pathsep))


if __name__ == "__main__":
    unittest.main()

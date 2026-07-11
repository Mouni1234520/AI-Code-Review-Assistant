from unittest.mock import patch

from launcher import ensure_backend


def test_ensure_backend_starts_process_when_unreachable():
    with patch("launcher.backend_is_running", side_effect=[False, True]) as running_mock, patch("launcher.subprocess.Popen") as popen_mock:
        ensure_backend()

    popen_mock.assert_called_once()
    assert running_mock.call_count == 2

import os
import subprocess
import sys
import time
import urllib.request


def backend_is_running():
    try:
        with urllib.request.urlopen("http://127.0.0.1:5000/", timeout=1) as response:
            return response.status == 200
    except Exception:
        return False


def ensure_backend():
    if backend_is_running():
        return True

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    python_exe = sys.executable
    subprocess.Popen(
        [python_exe, "app.py"],
        cwd=backend_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == "nt" else 0,
    )

    for _ in range(20):
        if backend_is_running():
            return True
        time.sleep(0.5)

    return False


if __name__ == "__main__":
    ensure_backend()

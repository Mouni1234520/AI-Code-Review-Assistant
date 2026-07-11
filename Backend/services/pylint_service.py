import json
import os
import subprocess


def analyze_python_file(path):
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    env = os.environ.copy()
    pythonpath = env.get("PYTHONPATH", "")
    paths = [project_root]
    if pythonpath:
        paths.append(pythonpath)
    env["PYTHONPATH"] = os.pathsep.join(paths)

    result = subprocess.run(
        [
            "pylint",
            path,
            "--output-format=json"
        ],
        capture_output=True,
        text=True,
        cwd=project_root,
        env=env
    )

    if result.stdout:
        return json.loads(result.stdout)

    return []
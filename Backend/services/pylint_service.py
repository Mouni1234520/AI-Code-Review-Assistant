import subprocess
import json
import os

def analyze_pylint(file_path):
    """
    Run pylint on the target file and return parsed findings and calculated score.
    """
    try:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        env = os.environ.copy()
        python_path = env.get("PYTHONPATH", "")
        if python_path:
            env["PYTHONPATH"] = project_root + os.pathsep + python_path
        else:
            env["PYTHONPATH"] = project_root

        result = subprocess.run(
            ["pylint", file_path, "--output-format=json"],
            capture_output=True,
            text=True,
            cwd=project_root,
            env=env
        )

        findings = []
        if result.stdout:
            try:
                findings = json.loads(result.stdout)
            except json.JSONDecodeError:
                pass

        # Calculate a Code Quality Score out of 100
        # Deduct based on finding severity
        score = 100.0
        for item in findings:
            msg_type = item.get("type", "").lower()
            if msg_type in ("error", "fatal"):
                score -= 10.0
            elif msg_type == "warning":
                score -= 5.0
            elif msg_type == "refactor":
                score -= 2.0
            elif msg_type == "convention":
                score -= 1.0
            else:
                score -= 1.0

        score = max(0.0, score)

        # Standardize finding format for consistency
        formatted_findings = []
        for item in findings:
            formatted_findings.append({
                "line": item.get("line", 1),
                "column": item.get("column", 0),
                "message": item.get("message", ""),
                "symbol": item.get("symbol", ""),
                "type": item.get("type", "warning"),
                "message_id": item.get("message-id", "")
            })

        return {
            "findings": formatted_findings,
            "score": round(score, 2)
        }

    except Exception as e:
        return {
            "findings": [],
            "score": 0.0,
            "error": str(e)
        }
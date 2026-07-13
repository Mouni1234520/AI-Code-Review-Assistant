import subprocess
import json

def run_bandit(file_path):
    """
    Runs bandit security checks on a Python file and parses JSON findings.
    """
    try:
        # Bandit returns non-zero code if it finds issues (often exit code 1)
        result = subprocess.run(
            ["bandit", "-f", "json", file_path],
            capture_output=True,
            text=True
        )

        findings = []
        if result.stdout:
            try:
                data = json.loads(result.stdout)
                findings = data.get("results", [])
            except json.JSONDecodeError:
                pass

        # Standardize findings structure
        formatted_findings = []
        for item in findings:
            formatted_findings.append({
                "line": item.get("line_number", 1),
                "message": item.get("issue_text", ""),
                "severity": item.get("issue_severity", "MEDIUM"),
                "confidence": item.get("issue_confidence", "MEDIUM"),
                "symbol": item.get("test_id", "SECURITY")
            })

        return {
            "results": formatted_findings
        }

    except Exception as e:
        return {
            "results": [],
            "error": str(e)
        }
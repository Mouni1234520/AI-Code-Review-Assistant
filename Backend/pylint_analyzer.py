import subprocess

def run_pylint(file_path):

    try:
        result = subprocess.run(
            ["pylint", file_path],
            capture_output=True,
            text=True
        )

        return result.stdout

    except Exception as e:
        return str(e)
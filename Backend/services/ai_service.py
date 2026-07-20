import os
import json
import time
import urllib.request
import urllib.error

def _send_mistral_request(url, req_body, api_key, timeout=30, max_retries=2):
    """
    Executes an HTTP POST request to the Mistral API.
    Handles non-retryable errors (e.g. 401 Unauthorized) immediately with user action guidance.
    Retries transient errors (429 Rate Limit, 500/502/503/504 Server Error) with backoff.
    """
    req_data = json.dumps(req_body).encode("utf-8")
    
    last_error_msg = None
    for attempt in range(max_retries + 1):
        try:
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=timeout) as response:
                res_data = response.read().decode("utf-8")
                return json.loads(res_data), None
        except urllib.error.HTTPError as http_err:
            if http_err.code == 401:
                return None, "Mistral API Error (401 Unauthorized): Invalid or expired API Key. Please update your API Key in Settings or check your Mistral account."
            
            # Extract server message if possible
            try:
                err_body = http_err.read().decode("utf-8")
                err_json = json.loads(err_body)
                msg = err_json.get("message", str(http_err))
            except Exception:
                msg = str(http_err)
                
            last_error_msg = f"Mistral API Error: {msg}"

            # Retry transient errors (429, 5xx)
            if http_err.code in (429, 500, 502, 503, 504) and attempt < max_retries:
                time.sleep(1.5 * (attempt + 1))
                continue
            else:
                return None, last_error_msg
                
        except Exception as e:
            last_error_msg = f"General Error: {str(e)}"
            if attempt < max_retries:
                time.sleep(1)
                continue
            return None, last_error_msg
            
    return None, last_error_msg or "Unknown error calling Mistral API."


def run_ai_review(code_text, file_name, api_key=None):
    """
    Review code using Mistral AI model and return structured review JSON.
    Uses standard library urllib.request for maximum reliability.
    """
    if not api_key:
        api_key = os.environ.get("MISTRAL_API_KEY")
        
    if not api_key:
        return {
            "enabled": False,
            "message": "AI analysis skipped. Please configure your API key in Settings to activate AI Code Review."
        }

    # Prompt instructing Mistral to audit the code and respond in structured JSON
    system_instruction = (
        "You are an expert Senior Software Engineer. You conduct deep code reviews. "
        "Your task is to analyze the user's uploaded code and provide feedback in JSON format. "
        "Your JSON response must match the following schema exactly:\n"
        "{\n"
        "  \"score\": 85,\n"
        "  \"summary\": \"Overall summary of the code quality and areas for improvement...\",\n"
        "  \"findings\": [\n"
        "    {\n"
        "      \"severity\": \"HIGH\" | \"MEDIUM\" | \"LOW\" | \"INFO\",\n"
        "      \"issue\": \"Short issue title\",\n"
        "      \"explanation\": \"Detailed explanation of why it is an issue\",\n"
        "      \"suggestion\": \"Concrete refactoring or code replacement suggestion\",\n"
        "      \"file_name\": \"filename.py\",\n"
        "      \"line_number\": 12\n"
        "    }\n"
        "  ],\n"
        "  \"bugs\": [\"Bug description 1\", \"Bug description 2\"],\n"
        "  \"optimizations\": [\"Performance tip 1\", \"Performance tip 2\"],\n"
        "  \"refactoring\": [\"Clean code tip 1\", \"Clean code tip 2\"],\n"
        "  \"documentation\": {\n"
        "    \"module\": \"Module level docstring explanation...\",\n"
        "    \"classes\": [\n"
        "      {\n"
        "        \"name\": \"ClassName\",\n"
        "        \"docstring\": \"Class docstring explanation...\"\n"
        "      }\n"
        "    ],\n"
        "    \"functions\": [\n"
        "      {\n"
        "        \"name\": \"function_name\",\n"
        "        \"docstring\": \"Function docstring explanation...\"\n"
        "      }\n"
        "    ]\n"
        "  }\n"
        "}\n"
        "Do not include any markdown backticks, explanations, or extra characters outside the JSON. Return only raw JSON."
    )

    prompt = f"File name: {file_name}\n\nCode content:\n```\n{code_text}\n```"

    url = "https://api.mistral.ai/v1/chat/completions"
    model_name = os.environ.get("MISTRAL_MODEL", "open-mistral-7b")
    
    # Request body structure for Mistral API
    req_body = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"Review the following code:\n{prompt}"}
        ],
        "response_format": {
            "type": "json_object"
        }
    }

    res_json, err = _send_mistral_request(url, req_body, api_key, timeout=30, max_retries=2)
    if err:
        return {"enabled": True, "error": err}
        
    choices = res_json.get("choices", [])
    if not choices:
        return {"enabled": True, "error": "Mistral API returned no choices."}
        
    content = choices[0].get("message", {}).get("content", "").strip()
    if not content:
        return {"enabled": True, "error": "Mistral API returned empty content."}
        
    try:
        parsed_review = json.loads(content)
        parsed_review["enabled"] = True
        return parsed_review
    except Exception as parse_err:
        return {"enabled": True, "error": f"Failed to parse Mistral response: {str(parse_err)}"}


def run_ai_explain_and_fix(code_text, analysis_results, api_key=None):
    """
    Generate explanations and concrete fixes for code audit issues using Mistral AI.
    """
    if not api_key:
        api_key = os.environ.get("MISTRAL_API_KEY")
        
    if not api_key:
        return {
            "error": "Mistral API key is not configured. Please configure it in your Settings or environment."
        }

    system_instruction = (
        "You are an expert Principal Software Engineer and Security Architect. "
        "Your task is to analyze the user's code alongside the static analysis results from Pylint, Bandit, and Radon. "
        "Explain the issues in simple English, provide concrete and clean refactored code fixes, and suggest optimizations. "
        "Your response must be a raw JSON object matching this schema exactly:\n"
        "{\n"
        "  \"summary\": \"Brief summary of the code and its overall quality...\",\n"
        "  \"explanations\": [\n"
        "    {\n"
        "      \"issue\": \"Short issue name\",\n"
        "      \"tool\": \"Pylint\" | \"Bandit\" | \"Radon\" | \"General\",\n"
        "      \"line\": 12,\n"
        "      \"explanation\": \"Detailed explanation in simple English of what the issue is and why it matters.\",\n"
        "      \"fix_suggestion\": \"Concrete details of how to fix it.\",\n"
        "      \"improved_code\": \"Complete drop-in code snippet or function showing the refactored fix\"\n"
        "    }\n"
        "  ],\n"
        "  \"best_practices\": [\n"
        "    \"Specific best practice or clean-code optimization tip 1...\",\n"
        "    \"Specific best practice or clean-code optimization tip 2...\"\n"
        "  ],\n"
        "  \"security_recommendations\": [\n"
        "    \"Security hardening tip 1...\",\n"
        "    \"Security hardening tip 2...\"\n"
        "  ],\n"
        "  \"estimated_quality_after\": \"Est. Score: 95/100 (Excellent) - Refactoring has eliminated redundant loops, added missing docstrings, and improved safety...\"\n"
        "}\n"
        "Do not include any markdown formatting (like ```json or ```) outside the JSON. Return only raw, valid JSON."
    )

    pylint_clean = analysis_results.get("pylint")
    security_clean = analysis_results.get("security")
    complexity_clean = analysis_results.get("complexity")

    prompt = (
        f"CODE TO AUDIT:\n"
        f"```\n{code_text}\n```\n\n"
        f"STATIC ANALYSIS FINDINGS:\n"
        f"- Pylint findings: {json.dumps(pylint_clean)}\n"
        f"- Bandit security findings: {json.dumps(security_clean)}\n"
        f"- Radon complexity findings: {json.dumps(complexity_clean)}\n"
    )

    url = "https://api.mistral.ai/v1/chat/completions"
    model_name = os.environ.get("MISTRAL_MODEL", "open-mistral-7b")
    
    req_body = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ],
        "response_format": {
            "type": "json_object"
        }
    }

    res_json, err = _send_mistral_request(url, req_body, api_key, timeout=45, max_retries=2)
    if err:
        return {"error": err}

    choices = res_json.get("choices", [])
    if not choices:
        return {"error": "Mistral API returned no choices."}
        
    content = choices[0].get("message", {}).get("content", "").strip()
    if not content:
        return {"error": "Mistral API returned empty content."}
        
    try:
        parsed_suggestions = json.loads(content)
        return parsed_suggestions
    except Exception as parse_err:
        return {"error": f"Failed to parse Mistral response: {str(parse_err)}"}



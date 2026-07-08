def review_code(code):
    issues = []

    
    if len(code) > 500:
        issues.append("Code is too long. Try dividing it into functions.")
    
    if code.strip() == "":
        issues.append("Code is empty.")

    if len(issues) == 0:
        issues.append("No major issues found. Good code!")

    return issues
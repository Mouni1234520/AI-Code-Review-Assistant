from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.review import Review

report_bp = Blueprint("report", __name__)

@report_bp.route("/reviews/<int:review_id>/export/markdown", methods=["GET"])
@jwt_required()
def export_markdown(review_id):
    """
    Generate a markdown representation of the code review.
    """
    user_id = get_jwt_identity()
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404

        if review.project.user_id != int(user_id):
            return jsonify({"error": "Unauthorized access"}), 403

        # Formulate Markdown string
        md = []
        md.append(f"# AI Code Review Report: {review.project.project_name}")
        md.append(f"**Date:** {review.created_at.strftime('%Y-%m-%d %H:%M:%S') if review.created_at else 'N/A'}")
        md.append(f"**Overall Score:** {review.review_score}/100")
        md.append(f"\n## Summary\n{review.summary}")

        # List Findings
        md.append("\n## Review Findings")
        findings = review.findings
        if not findings:
            md.append("No critical linting or security warnings identified.")
        else:
            for idx, f in enumerate(findings, 1):
                md.append(f"### {idx}. [{f.severity}] {f.issue}")
                md.append(f"- **Location**: `{f.file_name}` line {f.line_number}")
                md.append(f"- **Explanation**: {f.explanation}")
                if f.suggestion:
                    md.append(f"- **Suggestion**: `{f.suggestion}`")
                md.append("")

        # AI Specific findings
        ai = review.get_ai_analysis()
        if ai.get("enabled"):
            if ai.get("bugs"):
                md.append("\n## Detected Bugs")
                for b in ai["bugs"]:
                    md.append(f"- {b}")

            if ai.get("optimizations"):
                md.append("\n## Optimization Tips")
                for o in ai["optimizations"]:
                    md.append(f"- {o}")

            if ai.get("refactoring"):
                md.append("\n## Refactoring & Best Practices")
                for r in ai["refactoring"]:
                    md.append(f"- {r}")

            doc = ai.get("documentation", {})
            if doc:
                md.append("\n## Generated Code Documentation")
                if doc.get("module"):
                    md.append(f"### Module Documentation\n{doc['module']}\n")
                if doc.get("classes"):
                    md.append("### Class Documentation")
                    for c in doc["classes"]:
                        md.append(f"- **Class `{c.get('name')}`**: {c.get('docstring')}")
                if doc.get("functions"):
                    md.append("\n### Function Documentation")
                    for fn in doc["functions"]:
                        md.append(f"- **Function `{fn.get('name')}`**: {fn.get('docstring')}")

        markdown_content = "\n".join(md)
        return jsonify({
            "filename": f"review_report_{review.id}.md",
            "markdown": markdown_content
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

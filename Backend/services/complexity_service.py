from radon.visitors import ComplexityVisitor
from radon.metrics import mi_visit
from radon.raw import analyze

def get_mi_rank(score):
    """
    Ranks the maintainability index score according to standard Radon rankings.
    A: 20-100 (Highly maintainable)
    B: 10-19 (Medium maintainability)
    C: 0-9 (Low maintainability)
    """
    if score > 19:
        return "A (High)"
    elif score > 9:
        return "B (Medium)"
    else:
        return "C (Low)"

def analyze_complexity(file_path):
    """
    Compute Cyclomatic Complexity, Maintainability Index, and raw metrics
    for a Python file using the native Radon library APIs.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            code_text = f.read()

        # 1. Cyclomatic Complexity
        blocks = []
        try:
            visitor = ComplexityVisitor.from_code(code_text)
            for block in visitor.blocks:
                # Determine type (class/function/method)
                block_type = "function"
                if hasattr(block, 'classname') and block.classname:
                    block_type = "method"
                elif block.__class__.__name__ == "Class":
                    block_type = "class"
                
                blocks.append({
                    "type": block_type,
                    "name": block.name,
                    "complexity": block.complexity,
                    "line": block.lineno,
                    "symbol": block.name,
                    "rank": block.rank
                })
        except Exception as cc_err:
            pass

        # 2. Maintainability Index
        mi_score = 100.0
        mi_rank = "A (High)"
        try:
            mi_score = mi_visit(code_text, multi=True)
            mi_rank = get_mi_rank(mi_score)
        except Exception:
            pass

        # 3. Raw Metrics
        loc = 0
        lloc = 0
        sloc = 0
        comments = 0
        multi = 0
        blank = 0
        try:
            raw_metrics = analyze(code_text)
            loc = raw_metrics.loc
            lloc = raw_metrics.lloc
            sloc = raw_metrics.sloc
            comments = raw_metrics.comments
            multi = raw_metrics.multi
            blank = raw_metrics.blank
        except Exception:
            pass

        # 4. Stats Summary
        classes_count = sum(1 for b in blocks if b["type"] == "class")
        functions_count = sum(1 for b in blocks if b["type"] in ("function", "method"))
        avg_complexity = sum(b["complexity"] for b in blocks) / len(blocks) if blocks else 0

        # Calculate average function length (approximate)
        avg_func_length = round(sloc / max(1, functions_count), 1) if functions_count > 0 else 0

        return {
            "complexity": blocks,
            "mi": {
                "score": round(mi_score, 2),
                "rank": mi_rank
            },
            "raw": {
                "loc": loc,
                "lloc": lloc,
                "sloc": sloc,
                "comments": comments,
                "multi": multi,
                "blank": blank
            },
            "stats": {
                "classes_count": classes_count,
                "functions_count": functions_count,
                "avg_complexity": round(avg_complexity, 2),
                "avg_func_length": avg_func_length
            }
        }

    except Exception as e:
        return {
            "complexity": [],
            "mi": {"score": 0.0, "rank": "C (Low)"},
            "raw": {"loc": 0, "lloc": 0, "sloc": 0, "comments": 0, "multi": 0, "blank": 0},
            "stats": {"classes_count": 0, "functions_count": 0, "avg_complexity": 0, "avg_func_length": 0},
            "error": str(e)
        }
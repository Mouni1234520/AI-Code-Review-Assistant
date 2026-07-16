import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";

function CodeEditor({ analyzeSnippet, loading }) {
  const [code, setCode] = useState(
`# Paste your Python code here to analyze it!
def calculate_factorial(n):
    if n < 0:
        return None
    elif n == 0:
        return 1
    else:
        # A simple recursive implementation
        result = 1
        for i in range(1, n + 1):
            result *= i
        return result

print(calculate_factorial(5))
`
  );
  
  const [language, setLanguage] = useState("python");
  const [filename, setFilename] = useState("factorial.py");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      alert("Please paste some code to review.");
      return;
    }
    analyzeSnippet(code, language, filename);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (lang === "javascript") {
      setFilename("script.js");
      setCode(
`// Paste your JavaScript code here to analyze it!
function calculateFactorial(n) {
  if (n < 0) return null;
  if (n === 0) return 1;
  
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

console.log(calculateFactorial(5));
`
      );
    } else if (lang === "java") {
      setFilename("Factorial.java");
      setCode(
`// Paste your Java code here to analyze it!
public class Factorial {
    public static Integer calculateFactorial(int n) {
        if (n < 0) return null;
        if (n == 0) return 1;
        
        int result = 1;
        for (int i = 1; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(calculateFactorial(5));
    }
}
`
      );
    } else if (lang === "c") {
      setFilename("factorial.c");
      setCode(
`// Paste your C code here to analyze it!
#include <stdio.h>

long calculateFactorial(int n) {
    if (n < 0) return -1;
    if (n == 0) return 1;
    
    long result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

int main() {
    printf("%ld\\n", calculateFactorial(5));
    return 0;
}
`
      );
    } else {
      setFilename("factorial.py");
      setCode(
`# Paste your Python code here to analyze it!
def calculate_factorial(n):
    if n < 0:
        return None
    elif n == 0:
        return 1
    else:
        # A simple recursive implementation
        result = 1
        for i in range(1, n + 1):
            result *= i
        return result

print(calculate_factorial(5))
`
      );
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header-bar">
        <span className="editor-title">📝 Code Editor</span>
        <div className="editor-actions">
          <select
            className="select-dropdown"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>
          <input
            type="text"
            className="select-dropdown"
            style={{ width: "130px", border: "1px solid var(--border-color)", padding: "4px 8px" }}
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Filename"
          />
        </div>
      </div>

      <div className="editor-textarea-wrapper">
        <textarea
          className="editor-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
      </div>

      <button className="btn-analyze" onClick={handleSubmit} disabled={loading}>
        <FaPlay size={12} />
        {loading ? "Running Audit..." : "Analyze Code Snippet"}
      </button>
    </div>
  );
}

export default CodeEditor;

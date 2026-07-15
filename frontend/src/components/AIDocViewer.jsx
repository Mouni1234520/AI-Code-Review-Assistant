import React from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

function AIDocViewer({ documentation }) {
  const [copiedKey, setCopiedKey] = React.useState("");

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  if (!documentation || (!documentation.module && (!documentation.classes || documentation.classes.length === 0) && (!documentation.functions || documentation.functions.length === 0))) {
    return (
      <div style={{ color: "var(--text-secondary)", fontStyle: "italic", padding: "10px" }}>
        No docstrings generated. Ensure your code contains classes or functions, and Mistral API is enabled.
      </div>
    );
  }

  return (
    <div style={{ textAlign: "left" }}>
      <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>Generated Documentation</h3>

      {documentation.module && (
        <div style={{ marginBottom: "20px" }}>
          <div className="doc-section-header">📁 Module-Level Documentation</div>
          <div className="doc-box">{documentation.module}</div>
          <button
            className="btn-copy"
            onClick={() => handleCopy(documentation.module, "module")}
          >
            {copiedKey === "module" ? <FaCheck /> : <FaCopy />}
            {copiedKey === "module" ? "Copied!" : "Copy Module Docstring"}
          </button>
        </div>
      )}

      {documentation.classes && documentation.classes.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div className="doc-section-header">🏛️ Class Documentation</div>
          {documentation.classes.map((cls, idx) => (
            <div key={idx} style={{ marginBottom: "15px" }}>
              <div style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>
                class {cls.name}:
              </div>
              <div className="doc-box">{cls.docstring}</div>
              <button
                className="btn-copy"
                onClick={() => handleCopy(cls.docstring, `class-${idx}`)}
              >
                {copiedKey === `class-${idx}` ? <FaCheck /> : <FaCopy />}
                {copiedKey === `class-${idx}` ? "Copied!" : `Copy ${cls.name} Doc`}
              </button>
            </div>
          ))}
        </div>
      )}

      {documentation.functions && documentation.functions.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div className="doc-section-header">🔧 Function/Method Documentation</div>
          {documentation.functions.map((fn, idx) => (
            <div key={idx} style={{ marginBottom: "15px" }}>
              <div style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>
                def {fn.name}(...):
              </div>
              <div className="doc-box">{fn.docstring}</div>
              <button
                className="btn-copy"
                onClick={() => handleCopy(fn.docstring, `fn-${idx}`)}
              >
                {copiedKey === `fn-${idx}` ? <FaCheck /> : <FaCopy />}
                {copiedKey === `fn-${idx}` ? "Copied!" : `Copy ${fn.name}() Doc`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIDocViewer;

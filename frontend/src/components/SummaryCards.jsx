import React from "react";
import { FaBug, FaExclamationTriangle, FaShieldAlt, FaChartLine } from "react-icons/fa";

function SummaryCards({ result, security, complexity }) {
  // result might be raw findings array or {findings: [], score: XX}
  const pylintFindings = Array.isArray(result) ? result : (result?.findings || []);

  const errors = pylintFindings.filter(
    (r) => (r.type || "").toLowerCase() === "error" || (r.type || "").toLowerCase() === "fatal"
  ).length;

  const warnings = pylintFindings.filter(
    (r) => (r.type || "").toLowerCase() === "warning"
  ).length;

  const securityIssues = security?.results ? security.results.length : 0;
  
  // Complexity score / MI rank
  const miRank = complexity?.mi?.rank || "A (High)";

  return (
    <div className="summary-grid">
      <div className="stat-card error">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className="stat-label">Syntax Errors</span>
          <FaBug style={{ color: "var(--danger)" }} />
        </div>
        <span className="stat-value">{errors}</span>
      </div>

      <div className="stat-card warning">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className="stat-label">Pylint Warnings</span>
          <FaExclamationTriangle style={{ color: "var(--warning)" }} />
        </div>
        <span className="stat-value">{warnings}</span>
      </div>

      <div className="stat-card security">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className="stat-label">Bandit Vulnerabilities</span>
          <FaShieldAlt style={{ color: "#ea580c" }} />
        </div>
        <span className="stat-value">{securityIssues}</span>
      </div>

      <div className="stat-card complexity">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className="stat-label">Maintainability Index</span>
          <FaChartLine style={{ color: "var(--primary)" }} />
        </div>
        <span className="stat-value" style={{ fontSize: "18px", marginTop: "12px" }}>
          {miRank}
        </span>
      </div>
    </div>
  );
}

export default SummaryCards;
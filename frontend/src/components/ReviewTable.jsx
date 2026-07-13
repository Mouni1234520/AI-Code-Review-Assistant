import React from "react";

function ReviewTable({ result, security, complexity }) {
  // result = pylint findings. In our new backend, it is a dict {findings: [], score: XX} OR old format array
  const pylintFindings = Array.isArray(result) ? result : (result?.findings || []);

  const formatSecurityData = () => {
    // security has results key
    const findings = security?.results || [];
    return findings.map((item) => ({
      tool: "Bandit",
      type: "security",
      severity: item.severity ? item.severity.toLowerCase() : "medium",
      line: item.line || "N/A",
      message: item.message || "",
      rule: item.symbol || "SECURITY"
    }));
  };

  const formatPylintData = () => {
    return pylintFindings.map((item) => {
      const msgType = (item.type || "warning").toLowerCase();
      let sev = "low";
      if (msgType in ("error", "fatal")) sev = "high";
      else if (msgType === "warning") sev = "medium";
      else if (msgType === "refactor" || msgType === "convention") sev = "low";
      
      return {
        tool: "Pylint",
        type: msgType,
        severity: sev,
        line: item.line || "N/A",
        message: item.message || "",
        rule: item.symbol || "LINT"
      };
    });
  };

  const formatComplexityData = () => {
    const blocks = complexity?.complexity || [];
    return blocks.map((item) => {
      // Complexity rank A/B = low complexity, C/D = medium, E/F = high
      const rank = item.rank || "A";
      let sev = "info";
      if (["E", "F"].includes(rank)) sev = "high";
      else if (["C", "D"].includes(rank)) sev = "medium";
      else sev = "low";

      return {
        tool: "Radon",
        type: item.type || "function",
        severity: sev,
        line: item.line || "N/A",
        message: `Cyclomatic Complexity of ${item.type} '${item.name}' is ${item.complexity} (Rank ${item.rank})`,
        rule: `CC_RANK_${item.rank}`
      };
    });
  };

  const allIssues = [
    ...formatPylintData(),
    ...formatSecurityData(),
    ...formatComplexityData()
  ];

  return (
    <div className="review-table-container">
      <h3 style={{ marginBottom: "15px", fontSize: "16px" }}>Detailed Analysis Logs ({allIssues.length} findings)</h3>

      {allIssues.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
          No static analysis issues or warnings found in this file!
        </p>
      ) : (
        <table className="results-table">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Line</th>
              <th>Finding Description</th>
              <th>Rule Code</th>
            </tr>
          </thead>
          <tbody>
            {allIssues.map((item, index) => (
              <tr key={index}>
                <td style={{ fontWeight: "600" }}>{item.tool}</td>
                <td style={{ textTransform: "capitalize", color: "var(--text-secondary)" }}>{item.type}</td>
                <td>
                  <span className={`severity-tag ${item.severity}`}>
                    {item.severity}
                  </span>
                </td>
                <td>{item.line}</td>
                <td>{item.message}</td>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                  {item.rule}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReviewTable;
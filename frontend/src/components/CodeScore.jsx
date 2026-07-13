import React from "react";

function CodeScore({ pylint, ai }) {
  // Extract scores
  const staticScore = pylint?.score !== undefined ? pylint.score : 100;
  const aiScore = ai?.enabled && ai?.score !== undefined ? ai.score : null;

  const getScoreColor = (score) => {
    if (score >= 80) return "var(--success)";
    if (score >= 50) return "var(--warning)";
    return "var(--danger)";
  };

  return (
    <div className="score-box" style={{ marginBottom: "25px" }}>
      <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>Performance & Quality Ratings</h3>
      
      <div className="score-flex-box">
        <div className="score-gauge-container" style={{ flex: 1 }}>
          <span className="stat-label">Static Analysis Rating</span>
          <span className="score-value-big" style={{ color: getScoreColor(staticScore) }}>
            {staticScore}%
          </span>
          <div className="progress" style={{ width: "100%", maxWidth: "250px", marginTop: "10px" }}>
            <div
              className="progress-fill"
              style={{
                width: `${staticScore}%`,
                backgroundColor: getScoreColor(staticScore)
              }}
            />
          </div>
        </div>

        {aiScore !== null && (
          <div className="score-gauge-container" style={{ flex: 1 }}>
            <span className="stat-label">AI Review Rating</span>
            <span className="score-value-big" style={{ color: getScoreColor(aiScore) }}>
              {aiScore}%
            </span>
            <div className="progress" style={{ width: "100%", maxWidth: "250px", marginTop: "10px" }}>
              <div
                className="progress-fill"
                style={{
                  width: `${aiScore}%`,
                  backgroundColor: getScoreColor(aiScore)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeScore;
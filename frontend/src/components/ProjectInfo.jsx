import React from "react";
import { FaPython, FaBrain, FaDatabase } from "react-icons/fa";

function ProjectInfo() {
  return (
    <div className="card-panel" style={{ marginTop: "35px", background: "rgba(255, 255, 255, 0.01)" }}>
      <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>
        ⚡ System Architecture
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", textAlign: "left" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <FaPython style={{ color: "var(--primary)", fontSize: "20px", marginTop: "2px" }} />
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Static Analysis</h4>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Pylint standards, Radon complexity, and Bandit security scans running natively.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <FaBrain style={{ color: "#a855f7", fontSize: "20px", marginTop: "2px" }} />
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Gemini AI Engine</h4>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Generates bug audits, performance optimization advice, and clean refactoring models.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <FaDatabase style={{ color: "var(--success)", fontSize: "20px", marginTop: "2px" }} />
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>SQLAlchemy SQLite</h4>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Relational DB schema tracking User accounts, Project submissions, and detailed review findings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectInfo;
import React from "react";
import { Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function PieChart({ result }) {
  // result might be raw findings array or {findings: [], score: XX}
  const pylintFindings = Array.isArray(result) ? result : (result?.findings || []);

  const errors = pylintFindings.filter(
    (r) => (r.type || "").toLowerCase() === "error" || (r.type || "").toLowerCase() === "fatal"
  ).length;
  
  const warnings = pylintFindings.filter((r) => (r.type || "").toLowerCase() === "warning").length;
  const suggestions = pylintFindings.filter(
    (r) => (r.type || "").toLowerCase() === "convention" || (r.type || "").toLowerCase() === "refactor"
  ).length;

  const data = {
    labels: ["Errors", "Warnings", "Suggestions"],
    datasets: [
      {
        data: [errors, warnings, suggestions],
        backgroundColor: ["#ef4444", "#f59e0b", "#6366f1"],
        borderColor: "#111827",
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9ca3af", // Dark mode label colors
          font: {
            family: "'Outfit', sans-serif",
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="chart-card">
      <h3 style={{ fontSize: "15px", marginBottom: "15px", color: "var(--text-secondary)" }}>📊 Finding Breakdown</h3>
      <div className="chart-wrapper">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}

export default PieChart;
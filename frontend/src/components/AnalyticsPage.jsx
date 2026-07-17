import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { FaCode, FaBug, FaExclamationTriangle, FaStar } from "react-icons/fa";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, 
  LineElement, ArcElement, Title, Tooltip, Legend
);

function AnalyticsPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${API_BASE_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data || []);
      } catch (err) {
        console.error("Failed to fetch history for analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Prepare fallback mock data if no history exists yet
  const displayHistory = history.length > 0 ? history : [
    { id: 1, review_score: 85, pylint_result: { findings: [{type: "convention"}, {type: "warning"}] }, security_result: { results: [{severity: "MEDIUM"}] }, created_at: "2026-07-09T10:00:00" },
    { id: 2, review_score: 92, pylint_result: { findings: [{type: "convention"}] }, security_result: { results: [] }, created_at: "2026-07-10T12:00:00" },
    { id: 3, review_score: 74, pylint_result: { findings: [{type: "error"}, {type: "warning"}, {type: "refactor"}] }, security_result: { results: [{severity: "HIGH"}] }, created_at: "2026-07-12T15:30:00" },
    { id: 4, review_score: 88, pylint_result: { findings: [{type: "refactor"}] }, security_result: { results: [] }, created_at: "2026-07-14T09:00:00" },
    { id: 5, review_score: 95, pylint_result: { findings: [] }, security_result: { results: [] }, created_at: "2026-07-15T18:00:00" }
  ];

  // Calculate Metrics
  const totalReviews = history.length > 0 ? history.length : displayHistory.length;
  
  let totalErrors = 0;
  let totalWarnings = 0;
  let scoreSum = 0;

  displayHistory.forEach(item => {
    scoreSum += (item.review_score !== undefined ? item.review_score : 100);
    
    // Count Pylint errors/warnings
    const pylint = typeof item.pylint_result === 'string' ? JSON.parse(item.pylint_result) : item.pylint_result;
    if (pylint && pylint.findings) {
      pylint.findings.forEach(f => {
        const type = (f.type || '').toLowerCase();
        if (type === 'error' || type === 'fatal') totalErrors++;
        else totalWarnings++;
      });
    }

    // Count Security findings
    const security = typeof item.security_result === 'string' ? JSON.parse(item.security_result) : item.security_result;
    if (security && security.results) {
      security.results.forEach(s => {
        const sev = (s.severity || '').toLowerCase();
        if (sev === 'high') totalErrors++;
        else totalWarnings++;
      });
    }
  });

  const avgScore = totalReviews > 0 ? Math.round(scoreSum / totalReviews) : 100;

  // Chart 1: Weekly Reviews
  // Group displayHistory by day of week
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  displayHistory.forEach(item => {
    if (item.created_at) {
      const day = new Date(item.created_at).getDay();
      weekdayCounts[day]++;
    }
  });
  const weeklyData = {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [
      {
        label: 'Reviews Completed',
        data: weekdayCounts,
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  // Chart 2: Code Quality Trend
  // Sort reviews chronologically
  const sortedReviews = [...displayHistory].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const qualityData = {
    labels: sortedReviews.map((r, i) => {
      if (r.created_at) {
        return new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      return `Review #${i + 1}`;
    }),
    datasets: [
      {
        label: 'Code Score Trend',
        data: sortedReviews.map(r => r.review_score !== undefined ? r.review_score : 100),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointHoverRadius: 8
      }
    ]
  };

  // Chart 3: Error Category Distribution
  let errorTypes = { error: 0, warning: 0, refactor: 0, convention: 0, security: 0 };
  displayHistory.forEach(item => {
    const pylint = typeof item.pylint_result === 'string' ? JSON.parse(item.pylint_result) : item.pylint_result;
    if (pylint && pylint.findings) {
      pylint.findings.forEach(f => {
        const type = (f.type || '').toLowerCase();
        if (errorTypes[type] !== undefined) errorTypes[type]++;
        else if (type === 'fatal') errorTypes.error++;
        else errorTypes.warning++;
      });
    }
    const security = typeof item.security_result === 'string' ? JSON.parse(item.security_result) : item.security_result;
    if (security && security.results) {
      errorTypes.security += (security.results.length || 0);
    }
  });

  const distData = {
    labels: ['Errors', 'Warnings', 'Refactoring', 'Convention', 'Security Issues'],
    datasets: [
      {
        data: [errorTypes.error, errorTypes.warning, errorTypes.refactor, errorTypes.convention, errorTypes.security],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(168, 85, 247, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9ca3af',
          font: { family: 'Outfit' }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
      }
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Gain insights into code scores, finding categories, and weekly quality trends.</p>
      </div>

      {/* Metrics Cards */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }}>
            <FaCode />
          </div>
          <div className="analytics-card-details">
            <h3>Total Reviews</h3>
            <span>{totalReviews}</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }}>
            <FaBug />
          </div>
          <div className="analytics-card-details">
            <h3>Total Errors</h3>
            <span>{totalErrors}</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}>
            <FaExclamationTriangle />
          </div>
          <div className="analytics-card-details">
            <h3>Total Warnings</h3>
            <span>{totalWarnings}</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
            <FaStar />
          </div>
          <div className="analytics-card-details">
            <h3>Average Score</h3>
            <span>{avgScore}/100</span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="chart-card-full">
        <h3>📈 Code Quality Trend</h3>
        <div style={{ height: "300px" }}>
          <Line data={qualityData} options={chartOptions} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "25px", marginBottom: "25px" }} className="charts-grid">
        <div className="chart-card" style={{ height: "350px", display: "block" }}>
          <h3 style={{ fontSize: "15px", color: "var(--text-primary)", marginBottom: "15px", fontWeight: "700" }}>📅 Weekly Review Distribution</h3>
          <div style={{ height: "270px" }}>
            <Bar data={weeklyData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card" style={{ height: "350px", display: "block" }}>
          <h3 style={{ fontSize: "15px", color: "var(--text-primary)", marginBottom: "15px", fontWeight: "700" }}>🍕 Find Categories Distribution</h3>
          <div style={{ height: "250px", display: "flex", justifyContent: "center" }}>
            <Doughnut 
              data={distData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#9ca3af', font: { family: 'Outfit' } }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;

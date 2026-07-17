import React, { useState, useEffect } from "react";
import { FaSearch, FaTrashAlt, FaChevronRight, FaFileAlt } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";

function HistoryList({ onLoadReview, activeReviewId }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, reviewId) => {
    e.stopPropagation(); // Avoid triggering load
    if (!window.confirm("Are you sure you want to delete this code review?")) {
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from state
      setHistory(history.filter((item) => item.id !== reviewId));
      alert("Review deleted successfully.");
    } catch (err) {
      alert("Failed to delete review: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "high-score";
    if (score >= 50) return "mid-score";
    return "low-score";
  };

  const getFilteredHistory = () => {
    return history.filter((item) => {
      const matchesSearch = item.project_name.toLowerCase().includes(search.toLowerCase());
      
      let matchesScore = true;
      if (scoreFilter === "high") matchesScore = item.review_score >= 80;
      else if (scoreFilter === "mid") matchesScore = item.review_score >= 50 && item.review_score < 80;
      else if (scoreFilter === "low") matchesScore = item.review_score < 50;

      return matchesSearch && matchesScore;
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filtered = getFilteredHistory();

  return (
    <div className="card-panel">
      <div className="panel-title">
        <FaChevronRight style={{ transform: "rotate(90deg)" }} />
        Review History Log
      </div>

      <div className="history-filters">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search files by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="select-dropdown"
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            style={{ padding: "10px 16px", height: "42px" }}
          >
            <option value="all">All Scores</option>
            <option value="high">Good (80-100)</option>
            <option value="mid">Warning (50-79)</option>
            <option value="low">Critical (0-49)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Retrieving history log...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
          No review records found matching your filters.
        </p>
      ) : (
        <div className="history-list">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`history-item ${activeReviewId === item.id ? "active" : ""}`}
              onClick={() => onLoadReview(item)}
            >
              <div className="history-item-left">
                <div className={`history-score-badge ${getScoreClass(item.review_score)}`}>
                  {item.review_score}
                </div>
                <div className="history-item-details">
                  <h4>{item.project_name}</h4>
                  <div className="history-item-meta">
                    <span>Type: {item.upload_type}</span>
                    <span>Date: {formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="history-item-actions">
                <button
                  className="btn-delete-history"
                  onClick={(e) => handleDelete(e, item.id)}
                  title="Delete review"
                >
                  <FaTrashAlt />
                </button>
                <FaChevronRight style={{ color: "var(--text-muted)" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryList;

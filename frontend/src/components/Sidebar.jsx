import React from "react";
import { FaCode, FaHistory, FaCog, FaSignOutAlt, FaTerminal } from "react-icons/fa";

function Sidebar({ username, activeTab, setActiveTab, onLogout }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <FaTerminal className="logo-icon" />
        <h2>CodeAuditor AI</h2>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <FaCode />
          Dashboard
        </button>

        <button
          className={`nav-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory />
          Review History
        </button>

        <button
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <FaCog />
          Settings
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="user-avatar">
            {getInitials(username)}
          </div>
          <div className="user-info">
            <span className="user-name">{username}</span>
            <span className="user-role">Developer</span>
          </div>
        </div>

        <button className="btn-logout" onClick={onLogout}>
          <FaSignOutAlt />
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

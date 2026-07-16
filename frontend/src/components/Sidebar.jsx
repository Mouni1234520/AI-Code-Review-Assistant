import React from "react";
import { NavLink } from "react-router-dom";
import { 
  FaCode, FaHistory, FaCog, FaSignOutAlt, FaTerminal, 
  FaTasks, FaFileAlt, FaChartBar, FaQuestionCircle, FaUser, FaTimes, FaTachometerAlt
} from "react-icons/fa";

function Sidebar({ username, onLogout, mobileOpen, setMobileOpen, tasksCount }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const closeMobileSidebar = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <div className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-logo">
        <FaTerminal className="logo-icon" />
        <h2>CodeAuditor AI</h2>
        <button className="btn-mobile-toggle" style={{ display: "flex", marginLeft: "auto", fontSize: "16px" }} onClick={closeMobileSidebar}>
          <FaTimes />
        </button>
      </div>

      <nav className="sidebar-nav" style={{ overflowY: "auto", maxHeight: "calc(100vh - 180px)", paddingBottom: "20px" }}>
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaTachometerAlt />
          Dashboard
        </NavLink>

        <NavLink
          to="/code-review"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaCode />
          Code Review
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaHistory />
          Review History
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaTasks />
          <span>Tasks</span>
          {tasksCount > 0 && (
            <span style={{
              marginLeft: "auto",
              background: "var(--warning)",
              color: "#0a0e17",
              fontSize: "11px",
              fontWeight: "700",
              padding: "2px 6px",
              borderRadius: "10px",
              lineHeight: "1"
            }}>
              {tasksCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaFileAlt />
          Reports
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaChartBar />
          Analytics
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaCog />
          Settings
        </NavLink>

        <NavLink
          to="/help"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaQuestionCircle />
          Help
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={closeMobileSidebar}
        >
          <FaUser />
          Profile
        </NavLink>
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

        <button className="btn-logout" onClick={() => { closeMobileSidebar(); onLogout(); }}>
          <FaSignOutAlt />
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

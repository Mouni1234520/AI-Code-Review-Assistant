import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBars, FaBell, FaSun, FaMoon, FaUser, FaSignOutAlt, FaTachometerAlt, FaCog, FaHistory
} from "react-icons/fa";

function Navbar({ 
  username, 
  userEmail, 
  theme, 
  setTheme, 
  onLogout, 
  setMobileOpen,
  notifications = [],
  clearNotifications,
  markNotificationsAsRead
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  const handleProfileMenuItemClick = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="btn-mobile-toggle" onClick={() => setMobileOpen(prev => !prev)}>
          <FaBars />
        </button>
        <div>
          <h1 className="navbar-brand-title">AI Code Review Assistant</h1>
          <p className="navbar-brand-subtitle" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            Smart Code Analysis & Diagnostics
          </p>
        </div>
      </div>

      <div className="navbar-right-controls">
        {/* Dark/Light mode toggle */}
        <button 
          className="btn-theme-toggle" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <FaSun style={{ color: "#fbbf24" }} /> : <FaMoon style={{ color: "#6366f1" }} />}
        </button>

        {/* Notifications */}
        <div className="notification-container" ref={notificationRef}>
          <button 
            className="btn-notification" 
            onClick={handleNotificationClick}
            title="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <h4>Notifications</h4>
                {notifications.length > 0 && (
                  <button className="btn-clear-notifications" onClick={clearNotifications}>
                    Clear All
                  </button>
                )}
              </div>
              <div className="notification-list" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", padding: "10px", textAlign: "center" }}>
                    No notifications
                  </p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notification-item ${!n.read ? "unread" : ""}`}>
                      <p className="notification-item-text">{n.message}</p>
                      <span className="notification-item-time">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile avatar and dropdown */}
        <div className="profile-dropdown-container" ref={profileRef}>
          <div 
            className="profile-avatar-trigger" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="User Profile"
          >
            {getInitials(username)}
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <span className="profile-dropdown-name">{username}</span>
                <span className="profile-dropdown-email">{userEmail || "Developer"}</span>
              </div>
              
              <button className="profile-dropdown-item" onClick={() => handleProfileMenuItemClick("/")}>
                <FaTachometerAlt /> Dashboard
              </button>
              
              <button className="profile-dropdown-item" onClick={() => handleProfileMenuItemClick("/history")}>
                <FaHistory /> Review History
              </button>
              
              <button className="profile-dropdown-item" onClick={() => handleProfileMenuItemClick("/settings")}>
                <FaCog /> Settings
              </button>
              
              <button className="profile-dropdown-item" onClick={() => handleProfileMenuItemClick("/profile")}>
                <FaUser /> My Profile
              </button>
              
              <hr style={{ border: "0.5px solid var(--border-color)", margin: "4px 0" }} />
              
              <button className="profile-dropdown-item" style={{ color: "var(--danger)" }} onClick={() => { setShowProfileMenu(false); onLogout(); }}>
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
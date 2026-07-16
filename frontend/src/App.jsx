import { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  FaCode, FaHistory, FaCheck, FaExclamationTriangle, FaBell, FaInfoCircle, FaDownload, 
  FaArrowRight, FaTasks, FaChartBar, FaUserClock, FaRocket, FaUser, FaCog, FaQuestionCircle, FaStar
} from "react-icons/fa";

import "./App.css";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import UploadBox from "./components/UploadBox";
import CodeEditor from "./components/CodeEditor";
import SummaryCards from "./components/SummaryCards";
import CodeScore from "./components/CodeScore";
import PieChart from "./components/PieChart";
import ReviewTable from "./components/ReviewTable";
import DownloadOptions from "./components/DownloadOptions";
import AIDocViewer from "./components/AIDocViewer";
import HistoryList from "./components/HistoryList";
import TasksPage from "./components/TasksPage";
import AnalyticsPage from "./components/AnalyticsPage";

function DashboardOverview({ username, history, recentActivity, tasksCount }) {
  const totalReviews = history.length;
  const avgScore = totalReviews > 0 ? Math.round(history.reduce((sum, item) => sum + (item.review_score || 100), 0) / totalReviews) : 0;
  
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div className="page-header">
        <h1>Welcome Back, {username}!</h1>
        <p>Your centralized code quality and audit hub.</p>
      </div>

      {/* Quick stats row */}
      <div className="analytics-grid" style={{ marginBottom: "25px" }}>
        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }}>
            <FaCode />
          </div>
          <div className="analytics-card-details">
            <h3>Completed Audits</h3>
            <span>{totalReviews}</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
            <FaRocket />
          </div>
          <div className="analytics-card-details">
            <h3>Average Score</h3>
            <span>{totalReviews > 0 ? `${avgScore}/100` : "N/A"}</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}>
            <FaTasks />
          </div>
          <div className="analytics-card-details">
            <h3>Pending Tasks</h3>
            <span>{tasksCount}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "25px" }} className="dashboard-grid">
        {/* Left: Quick Actions */}
        <div className="card-panel">
          <div className="panel-title">⚡ Quick Actions</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
            Select an action below to start auditing code or manage your pending tasks.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/code-review" className="btn-analyze" style={{ textDecoration: "none", width: "100%", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🚀 Start New Code Review</span>
              <FaArrowRight />
            </Link>
            <Link to="/tasks" className="btn-save" style={{ textDecoration: "none", width: "100%", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>📋 Manage Dev Tasks</span>
              <FaArrowRight />
            </Link>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="card-panel">
          <div className="panel-title"><FaUserClock /> Recent Activity</div>
          <div className="recent-activity-panel">
            <div className="activity-item">
              <FaCode className="activity-item-icon" />
              <div className="activity-item-content">
                <span className="activity-item-title">Last Analyzed File</span>
                <span className="activity-item-time">{recentActivity.lastAnalyzed || "None"}</span>
              </div>
            </div>
            <div className="activity-item">
              <FaDownload className="activity-item-icon" style={{ color: "var(--success)" }} />
              <div className="activity-item-content">
                <span className="activity-item-title">Last Downloaded Report</span>
                <span className="activity-item-time">{recentActivity.lastDownload || "None"}</span>
              </div>
            </div>
            <div className="activity-item">
              <FaUserClock className="activity-item-icon" style={{ color: "var(--warning)" }} />
              <div className="activity-item-content">
                <span className="activity-item-title">Last Login Session</span>
                <span className="activity-item-time">{recentActivity.lastLogin || "None"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-header">
        <h1>Help & Documentation</h1>
        <p>Learn how to use AI Code Review Assistant effectively.</p>
      </div>
      <div className="card-panel">
        <div className="panel-title"><FaInfoCircle /> Getting Started</div>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", marginBottom: "15px" }}>
          1. Configure your Mistral API Key in Settings to get full semantic AI suggestions, bugs detection, and documentation comments.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", marginBottom: "15px" }}>
          2. Head over to <strong>Code Review</strong> tab. You can either paste a raw snippet of Python/Javascript code or drag-and-drop a `.py` file to perform local static scans.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
          3. Once the analysis finishes, check your scores, pylint ratings, bandit warnings, and radon complexity rankings, then export reports as PDF, Word, or plain text!
        </p>
      </div>
    </div>
  );
}

function ProfilePage({ username, userEmail, recentActivity }) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-header">
        <h1>User Profile</h1>
        <p>Manage your account credentials and view your review sessions.</p>
      </div>
      <div className="card-panel">
        <div className="panel-title"><FaUser /> Account Details</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", margin: "20px 0" }}>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Username</span>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{username}</p>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Email Address</span>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{userEmail || "Not configured"}</p>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Account Type</span>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--primary)" }}>Developer</p>
          </div>
        </div>
      </div>

      <div className="card-panel">
        <div className="panel-title"><FaUserClock /> Account Activity Logs</div>
        <div className="recent-activity-panel">
          <div className="activity-item">
            <FaCode className="activity-item-icon" />
            <div className="activity-item-content">
              <span className="activity-item-title">Last Code Analysis</span>
              <span className="activity-item-time">{recentActivity.lastAnalyzed || "None"}</span>
            </div>
          </div>
          <div className="activity-item">
            <FaUserClock className="activity-item-icon" style={{ color: "var(--warning)" }} />
            <div className="activity-item-content">
              <span className="activity-item-title">Last Authentication Login</span>
              <span className="activity-item-time">{recentActivity.lastLogin || "None"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Notifications state (loaded from local storage)
  const [notifications, setNotifications] = useState([]);
  
  // Recent activities state
  const [recentActivity, setRecentActivity] = useState({
    lastAnalyzed: "",
    lastDownload: "",
    lastLogin: ""
  });

  // Settings
  const [mistralKey, setMistralKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  // Analysis result states
  const [file, setFile] = useState(null);
  const [currentFilename, setCurrentFilename] = useState("");
  const [pylintResult, setPylintResult] = useState(null);
  const [securityResult, setSecurityResult] = useState(null);
  const [complexityResult, setComplexityResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [reviewId, setReviewId] = useState(null);
  const [score, setScore] = useState(100);
  const [summary, setSummary] = useState("");
  
  // Loader & Progress
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStageIndex, setAnalysisStageIndex] = useState(0);

  // Task count state
  const [tasksCount, setTasksCount] = useState(0);
  const [history, setHistory] = useState([]);

  // Check login & load settings on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    const storedKey = localStorage.getItem("mistral_api_key");

    // Load notifications
    const storedNotifs = localStorage.getItem("code_review_notifications");
    if (storedNotifs) {
      try { setNotifications(JSON.parse(storedNotifs)); } catch (e) { console.error(e); }
    }

    // Load activities
    const storedActivity = localStorage.getItem("code_review_activity");
    if (storedActivity) {
      try { setRecentActivity(JSON.parse(storedActivity)); } catch (e) { console.error(e); }
    }

    if (token) {
      setIsAuthenticated(true);
      setUsername(storedUsername || "Developer");
      setUserEmail(storedEmail || "");
      fetchHistory(token);
    }
    if (storedKey) {
      setMistralKey(storedKey);
    }

    // Initialize theme class
    document.body.className = theme === "light" ? "light-theme" : "dark-theme";

    // Refresh tasks count
    refreshTasksCount();
  }, []);

  useEffect(() => {
    document.body.className = theme === "light" ? "light-theme" : "dark-theme";
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Activity & Notification helper
  const addNotification = (message) => {
    const newNotif = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem("code_review_notifications", JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("code_review_notifications", JSON.stringify([]));
  };

  const markNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("code_review_notifications", JSON.stringify(updated));
  };

  // Event listener for CustomEvent on report downloads
  useEffect(() => {
    const handleDownload = (e) => {
      addNotification(`Report downloaded: ${e.detail.filename}`);
      const updatedActivity = { 
        ...recentActivity, 
        lastDownload: `${e.detail.filename} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` 
      };
      setRecentActivity(updatedActivity);
      localStorage.setItem("code_review_activity", JSON.stringify(updatedActivity));
    };

    window.addEventListener("report_downloaded", handleDownload);
    return () => {
      window.removeEventListener("report_downloaded", handleDownload);
    };
  }, [notifications, recentActivity]);

  const refreshTasksCount = () => {
    const stored = localStorage.getItem("code_review_tasks");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTasksCount(parsed.filter(t => !t.completed).length);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    const handleTasksUpdate = () => {
      refreshTasksCount();
    };
    window.addEventListener("tasks_updated", handleTasksUpdate);
    return () => {
      window.removeEventListener("tasks_updated", handleTasksUpdate);
    };
  }, []);

  const fetchHistory = async (token) => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const user = localStorage.getItem("username") || "Developer";
    const email = localStorage.getItem("email") || "";
    setUsername(user);
    setUserEmail(email);

    const loginTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedActivity = { ...recentActivity, lastLogin: loginTime };
    setRecentActivity(updatedActivity);
    localStorage.setItem("code_review_activity", JSON.stringify(updatedActivity));

    addNotification("Login successful! Welcome to the AI Code Review Hub.");
    
    const token = localStorage.getItem("access_token");
    fetchHistory(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setIsAuthenticated(false);
    setUsername("");
    setUserEmail("");
    clearAnalysis();
  };

  const clearAnalysis = () => {
    setPylintResult(null);
    setSecurityResult(null);
    setComplexityResult(null);
    setAiResult(null);
    setReviewId(null);
    setCurrentFilename("");
    setFile(null);
    setScore(100);
    setSummary("");
  };

  const saveMistralKey = (e) => {
    e.preventDefault();
    localStorage.setItem("mistral_api_key", mistralKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");

    if (newPassword !== confirmPassword) {
      setProfileError("New passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        "http://127.0.0.1:5000/profile",
        { password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setProfileError(err.response?.data?.error || "Failed to update profile.");
    }
  };

  // Run analysis stage progression simulation
  const simulateStages = (uploadingRealFile = false) => {
    setAnalysisStageIndex(0);
    if (!uploadingRealFile) {
      setUploadProgress(10);
      let up = 10;
      const interval = setInterval(() => {
        up += 30;
        if (up >= 100) {
          clearInterval(interval);
          setUploadProgress(100);
          goToPylintStage();
        } else {
          setUploadProgress(up);
        }
      }, 200);
    }
  };

  const goToPylintStage = () => {
    setAnalysisStageIndex(1);
    setTimeout(() => {
      goToAIStage();
    }, 1200);
  };

  const goToAIStage = () => {
    setAnalysisStageIndex(2);
  };

  // Perform upload file audit
  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file to analyze");
      return;
    }

    const token = localStorage.getItem("access_token");
    const storedKey = localStorage.getItem("mistral_api_key") || "";
    const formData = new FormData();
    if (Array.isArray(file)) {
      file.forEach((f) => {
        formData.append("file", f);
      });
    } else {
      formData.append("file", file);
    }

    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    setAnalysisStageIndex(0);
    clearAnalysis();

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-Mistral-API-Key": storedKey
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Limit actual upload progress to 90% until server responds, to simulate final stage smoothly
            setUploadProgress(Math.min(90, percentCompleted));
          }
        }
      );

      setUploadProgress(100);
      // Simulate backend analysis progression before displaying results
      goToPylintStage();
      
      setTimeout(() => {
        setAnalysisStageIndex(3); // Completed
        setIsUploading(false);
        setLoading(false);
        loadAnalysisData(response.data);
        
        // Add file uploaded notification
        addNotification(`File uploaded and analyzed: ${response.data.filename}`);
        const updatedActivity = { 
          ...recentActivity, 
          lastAnalyzed: `${response.data.filename} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` 
        };
        setRecentActivity(updatedActivity);
        localStorage.setItem("code_review_activity", JSON.stringify(updatedActivity));
        
        fetchHistory(token);
      }, 2000);

    } catch (error) {
      console.error(error);
      setIsUploading(false);
      setLoading(false);
      alert("File analysis failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  // Perform snippet code audit
  const analyzeSnippet = async (code, language, filename) => {
    const token = localStorage.getItem("access_token");
    const storedKey = localStorage.getItem("mistral_api_key") || "";

    setLoading(true);
    setIsUploading(true);
    clearAnalysis();
    simulateStages(false);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        { code, language, filename },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-Mistral-API-Key": storedKey
          }
        }
      );

      setTimeout(() => {
        setAnalysisStageIndex(3);
        setIsUploading(false);
        setLoading(false);
        loadAnalysisData(response.data);
        
        addNotification(`Code snippet analyzed: ${response.data.filename}`);
        const updatedActivity = { 
          ...recentActivity, 
          lastAnalyzed: `${response.data.filename} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` 
        };
        setRecentActivity(updatedActivity);
        localStorage.setItem("code_review_activity", JSON.stringify(updatedActivity));

        fetchHistory(token);
      }, 2500);

    } catch (error) {
      console.error(error);
      setIsUploading(false);
      setLoading(false);
      alert("Snippet analysis failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  const syncTasksForFile = (filename, pylintData, securityData, complexityData) => {
    const stored = localStorage.getItem("code_review_tasks");
    let currentTasks = [];
    if (stored) {
      try {
        currentTasks = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }

    const pylintFindings = Array.isArray(pylintData) ? pylintData : (pylintData?.findings || []);
    const formatPylintData = () => {
      return pylintFindings.map((item) => {
        const msgType = (item.type || "warning").toLowerCase();
        let sev = "low";
        if (["error", "fatal"].includes(msgType)) sev = "high";
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

    const formatSecurityData = () => {
      const findings = securityData?.results || [];
      return findings.map((item) => ({
        tool: "Bandit",
        type: "security",
        severity: item.severity ? item.severity.toLowerCase() : "medium",
        line: item.line || "N/A",
        message: item.message || "",
        rule: item.symbol || "SECURITY"
      }));
    };

    const formatComplexityData = () => {
      const blocks = complexityData?.complexity || [];
      return blocks.map((item) => {
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

    const findings = [
      ...formatPylintData(),
      ...formatSecurityData(),
      ...formatComplexityData()
    ];

    // 1. Update existing tasks for this file
    const updatedTasks = currentTasks.map(t => {
      if (t.file === filename) {
        // Look for matching finding in the new analysis
        const stillExists = findings.some(f => 
          f.tool === t.tool &&
          f.rule === t.rule &&
          f.message === t.message
        );
        if (!stillExists) {
          // No longer exists, so it's rectified
          return { ...t, completed: true, rectified: true };
        } else {
          // Still exists, so keep active
          return { ...t, completed: false, rectified: false };
        }
      }
      return t;
    });

    // 2. Add any new findings that aren't already represented in the tasks list
    const newTasksToAdd = [];
    findings.forEach(finding => {
      const alreadyHasTask = updatedTasks.some(t => 
        t.file === filename &&
        t.tool === finding.tool &&
        t.rule === finding.rule &&
        t.message === finding.message
      );
      if (!alreadyHasTask) {
        newTasksToAdd.push({
          id: Date.now() + Math.random(),
          text: `[${finding.tool}] ${finding.rule} at line ${finding.line}: ${finding.message}`,
          file: filename,
          tool: finding.tool,
          rule: finding.rule,
          line: finding.line,
          message: finding.message,
          severity: finding.severity,
          completed: false,
          rectified: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    const finalTasks = [...newTasksToAdd, ...updatedTasks];
    localStorage.setItem("code_review_tasks", JSON.stringify(finalTasks));
    refreshTasksCount();
    window.dispatchEvent(new Event("tasks_updated"));
  };

  const loadAnalysisData = (data) => {
    setReviewId(data.review_id);
    setCurrentFilename(data.filename);
    setPylintResult(data.pylint || null);
    setSecurityResult(data.security || null);
    setComplexityResult(data.complexity || null);
    setAiResult(data.ai || null);
    setScore(data.score !== undefined ? data.score : 100);
    setSummary(data.summary || "");

    // Sync findings with tasks list
    syncTasksForFile(data.filename, data.pylint, data.security, data.complexity);
  };

  const handleLoadPreviousReview = (review) => {
    setReviewId(review.id);
    setCurrentFilename(review.project_name);
    setPylintResult(review.pylint_result || null);
    setSecurityResult(review.security_result || null);
    setComplexityResult(review.complexity_result || null);
    setAiResult(review.ai_analysis_result || null);
    setScore(review.review_score !== undefined ? review.review_score : 100);
    setSummary(review.summary || "");
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar
          username={username}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          onLogout={handleLogout}
          tasksCount={tasksCount}
        />
        
        <main className="main-content" style={{ width: "100%" }}>
          <Navbar 
            username={username}
            userEmail={userEmail}
            theme={theme}
            setTheme={setTheme}
            onLogout={handleLogout}
            setMobileOpen={setMobileSidebarOpen}
            notifications={notifications}
            clearNotifications={clearNotifications}
            markNotificationsAsRead={markNotificationsAsRead}
          />
          
          <Routes>
            {/* 1. Dashboard route */}
            <Route 
              path="/" 
              element={
                <DashboardOverview 
                  username={username} 
                  history={history} 
                  recentActivity={recentActivity} 
                  tasksCount={tasksCount} 
                />
              } 
            />

            {/* 2. Code Review route */}
            <Route 
              path="/code-review" 
              element={
                <>
                  <div className="page-header">
                    <h1>Code Audit Review</h1>
                    <p>Conduct static scans and trigger semantic AI quality reports.</p>
                  </div>

                  <div className="dashboard-grid">
                    {/* Left Column: Snippet Editor */}
                    <div className="card-panel">
                      <CodeEditor analyzeSnippet={analyzeSnippet} loading={loading} />
                    </div>

                    {/* Right Column: File Upload box */}
                    <div className="card-panel" style={{ height: "fit-content" }}>
                      <UploadBox 
                        setFile={setFile} 
                        uploadFile={uploadFile} 
                        loading={loading} 
                        uploadProgress={uploadProgress}
                        isUploading={isUploading}
                      />
                    </div>
                  </div>

                  {loading && (
                    <div className="analysis-loader-container">
                      <div className="analysis-spinner"></div>
                      <div className="analysis-loader-title">Analyzing your code...</div>
                      
                      <div className="analysis-stages-list">
                        <div className={`analysis-stage-item ${analysisStageIndex >= 1 ? 'completed' : 'active'}`}>
                          <span className="analysis-stage-bullet">{analysisStageIndex >= 1 ? "✓" : "1"}</span>
                          <span>Uploading File...</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: "4px", margin: "4px 0" }}>
                          <div className="progress-bar-fill" style={{ width: analysisStageIndex >= 1 ? '100%' : `${uploadProgress}%` }}></div>
                        </div>

                        <div className={`analysis-stage-item ${analysisStageIndex >= 2 ? 'completed' : (analysisStageIndex === 1 ? 'active' : '')}`}>
                          <span className="analysis-stage-bullet">{analysisStageIndex >= 2 ? "✓" : "2"}</span>
                          <span>Running Pylint Scans...</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: "4px", margin: "4px 0" }}>
                          <div className="progress-bar-fill" style={{ width: analysisStageIndex >= 2 ? '100%' : (analysisStageIndex === 1 ? '70%' : '0%') }}></div>
                        </div>

                        <div className={`analysis-stage-item ${analysisStageIndex === 2 ? 'active' : ''}`}>
                          <span className="analysis-stage-bullet">3</span>
                          <span>Generating AI Suggestions...</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: "4px", margin: "4px 0" }}>
                          <div className="progress-bar-fill" style={{ width: analysisStageIndex === 2 ? '100%' : '0%' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!loading && pylintResult && (
                    <div className="card-panel result-card" style={{ marginTop: "25px" }}>
                      <div className="panel-title" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                        <span>📊 Review Audit Results: {currentFilename}</span>
                        {reviewId && (
                          <DownloadOptions
                            filename={currentFilename}
                            score={score}
                            summary={summary}
                            pylint={pylintResult}
                            security={securityResult}
                            complexity={complexityResult}
                            ai={aiResult}
                          />
                        )}
                      </div>

                      <SummaryCards result={pylintResult} security={securityResult} complexity={complexityResult} />
                      <CodeScore pylint={pylintResult} ai={aiResult} />
                      
                      {/* Visual Charts and Complexity Breakdown */}
                      <div className="charts-grid">
                        <PieChart result={pylintResult} />
                        
                        {/* Radon Stats info */}
                        <div className="chart-card" style={{ alignItems: "stretch", justifyContent: "flex-start" }}>
                          <h3 style={{ fontSize: "15px", marginBottom: "15px", color: "var(--text-secondary)" }}>⚡ Raw Complexity Stats</h3>
                          <div className="raw-stats-grid">
                            <div className="raw-stat-item">
                              <span className="raw-stat-val">{complexityResult?.stats?.classes_count || 0}</span>
                              <br />
                              <span className="raw-stat-lbl">Classes</span>
                            </div>
                            <div className="raw-stat-item">
                              <span className="raw-stat-val">{complexityResult?.stats?.functions_count || 0}</span>
                              <br />
                              <span className="raw-stat-lbl">Functions</span>
                            </div>
                            <div className="raw-stat-item">
                              <span className="raw-stat-val">{complexityResult?.stats?.avg_complexity || 0}</span>
                              <br />
                              <span className="raw-stat-lbl">Avg Complexity</span>
                            </div>
                            <div className="raw-stat-item">
                              <span className="raw-stat-val">{complexityResult?.raw?.loc || 0}</span>
                              <br />
                              <span className="raw-stat-lbl">Total Lines (LOC)</span>
                            </div>
                            <div className="raw-stat-item">
                              <span className="raw-stat-val">{complexityResult?.raw?.comments || 0}</span>
                              <br />
                              <span className="raw-stat-lbl">Comments</span>
                            </div>
                            <div className="raw-stat-item">
                              <span className="raw-stat-val">{complexityResult?.stats?.avg_func_length || 0}</span>
                              <br />
                              <span className="raw-stat-lbl">Avg Func Length</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Relational Tabs */}
                      <div className="tab-container">
                        <ReviewTable result={pylintResult} security={securityResult} complexity={complexityResult} />
                      </div>

                      {/* AI Suggestions and Documentation Panels */}
                      {aiResult && aiResult.enabled && (
                        <>
                          {/* AI Suggestions Card Grid */}
                          <div className="card-panel" style={{ marginTop: "25px", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
                            <div className="panel-title" style={{ color: "#a855f7" }}><FaRocket /> AI Refactoring & Suggestions</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px", marginTop: "15px" }}>
                              {aiResult.bugs && aiResult.bugs.length > 0 && (
                                <div style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "15px", borderRadius: "10px" }}>
                                  <h4 style={{ color: "var(--danger)", fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>🐛 Detected Bugs</h4>
                                  <ul style={{ paddingLeft: "15px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                                    {aiResult.bugs.map((b, i) => <li key={i} style={{ marginBottom: "6px" }}>{b}</li>)}
                                  </ul>
                                </div>
                              )}
                              {aiResult.optimizations && aiResult.optimizations.length > 0 && (
                                <div style={{ background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "15px", borderRadius: "10px" }}>
                                  <h4 style={{ color: "var(--success)", fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>🚀 Performance Optimization</h4>
                                  <ul style={{ paddingLeft: "15px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                                    {aiResult.optimizations.map((o, i) => <li key={i} style={{ marginBottom: "6px" }}>{o}</li>)}
                                  </ul>
                                </div>
                              )}
                              {aiResult.refactoring && aiResult.refactoring.length > 0 && (
                                <div style={{ background: "rgba(168, 85, 247, 0.03)", border: "1px solid rgba(168, 85, 247, 0.2)", padding: "15px", borderRadius: "10px" }}>
                                  <h4 style={{ color: "#a855f7", fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>✨ Clean Code Best Practices</h4>
                                  <ul style={{ paddingLeft: "15px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                                    {aiResult.refactoring.map((r, i) => <li key={i} style={{ marginBottom: "6px" }}>{r}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="card-panel" style={{ marginTop: "25px", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
                            <AIDocViewer documentation={aiResult.documentation} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              } 
            />

            {/* 3. Review History route */}
            <Route 
              path="/history" 
              element={
                <HistoryList 
                  onLoadReview={handleLoadPreviousReview} 
                  activeReviewId={reviewId} 
                />
              } 
            />

            {/* 4. Tasks manager route */}
            <Route 
              path="/tasks" 
              element={<TasksPage />} 
            />

            {/* 5. Analytics route */}
            <Route 
              path="/analytics" 
              element={<AnalyticsPage />} 
            />

            {/* 6. Settings route */}
            <Route 
              path="/settings" 
              element={
                <>
                  <div className="page-header">
                    <h1>Settings & Config</h1>
                    <p>Manage third-party LLM API keys and reset your profile password</p>
                  </div>

                  <div className="card-panel">
                    <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>🔑 Mistral API Key Configuration</h3>
                    <form onSubmit={saveMistralKey} className="settings-form">
                      <div className="form-group">
                        <label>Mistral AI API Key</label>
                        <input
                          type="password"
                          value={mistralKey}
                          onChange={(e) => setMistralKey(e.target.value)}
                          placeholder="Enter your Mistral AI API Key"
                          style={{ border: "1.5px solid var(--border-color)", width: "100%", padding: "12px", background: "var(--bg-primary)", color: "var(--text-primary)", borderRadius: "8px" }}
                        />
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px" }}>
                          Stored locally in your browser workspace. Key is sent in headers to audit Python code or provide semantic refactoring.
                        </p>
                      </div>
                      <button type="submit" className="btn-save">
                        {keySaved ? <FaCheck /> : null}
                        {keySaved ? "Saved Key" : "Save Key Configuration"}
                      </button>
                    </form>
                  </div>

                  <div className="card-panel">
                    <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>🔒 Update Profile Password</h3>
                    
                    {profileMsg && <div className="success-message">{profileMsg}</div>}
                    {profileError && <div className="error-message">{profileError}</div>}

                    <form onSubmit={handlePasswordChange} className="settings-form">
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          style={{ border: "1.5px solid var(--border-color)", width: "100%", padding: "12px", background: "var(--bg-primary)", color: "var(--text-primary)", borderRadius: "8px" }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          style={{ border: "1.5px solid var(--border-color)", width: "100%", padding: "12px", background: "var(--bg-primary)", color: "var(--text-primary)", borderRadius: "8px" }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          style={{ border: "1.5px solid var(--border-color)", width: "100%", padding: "12px", background: "var(--bg-primary)", color: "var(--text-primary)", borderRadius: "8px" }}
                          required
                        />
                      </div>
                      <button type="submit" className="btn-save">
                        Update Password
                      </button>
                    </form>
                  </div>
                </>
              } 
            />

            {/* 7. Help page route */}
            <Route 
              path="/help" 
              element={<HelpPage />} 
            />

            {/* 8. Profile route */}
            <Route 
              path="/profile" 
              element={
                <ProfilePage 
                  username={username} 
                  userEmail={userEmail} 
                  recentActivity={recentActivity} 
                />
              } 
            />

            {/* 9. Reports route (Download Hub redirects to dashboard results if exist or review history) */}
            <Route 
              path="/reports" 
              element={
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                  <div className="page-header">
                    <h1>Report Export Center</h1>
                    <p>Download generated audit files or review log sheets.</p>
                  </div>
                  <div className="card-panel" style={{ textAlign: "center", padding: "40px" }}>
                    <div className="panel-title" style={{ justifyContent: "center" }}><FaDownload /> Download Report Hub</div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "15px 0" }}>
                      To download a code audit report, complete a scan in <strong>Code Review</strong> or reload a previous scan from the <strong>Review History</strong> page.
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
                      <Link to="/code-review" className="btn-analyze" style={{ textDecoration: "none" }}>Go to Code Review</Link>
                      <Link to="/history" className="btn-save" style={{ textDecoration: "none" }}>Go to Review History</Link>
                    </div>
                  </div>
                </div>
              } 
            />

            {/* Catch-all redirection */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
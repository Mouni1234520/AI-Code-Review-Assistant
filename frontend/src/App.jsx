import { useState, useEffect } from "react";
import axios from "axios";
import { FaCode, FaHistory, FaCheck, FaExclamationTriangle } from "react-icons/fa";

import "./App.css";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import UploadBox from "./components/UploadBox";
import CodeEditor from "./components/CodeEditor";
import SummaryCards from "./components/SummaryCards";
import CodeScore from "./components/CodeScore";
import PieChart from "./components/PieChart";
import ReviewTable from "./components/ReviewTable";
import DownloadPDF from "./components/DownloadPDF";
import AIDocViewer from "./components/AIDocViewer";
import HistoryList from "./components/HistoryList";
import ProjectInfo from "./components/ProjectInfo";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'history', 'settings'
  
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
  const [loading, setLoading] = useState(false);

  // Check login & load settings on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    const storedKey = localStorage.getItem("mistral_api_key");

    if (token) {
      setIsAuthenticated(true);
      setUsername(storedUsername || "Developer");
      setUserEmail(storedEmail || "");
    }
    if (storedKey) {
      setMistralKey(storedKey);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUsername(localStorage.getItem("username") || "Developer");
    setUserEmail(localStorage.getItem("email") || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setIsAuthenticated(false);
    setUsername("");
    setUserEmail("");
    
    // Clear results
    clearAnalysis();
    setActiveTab("dashboard");
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
    clearAnalysis();

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-Mistral-API-Key": storedKey
          }
        }
      );

      loadAnalysisData(response.data);

    } catch (error) {
      console.error(error);
      alert("File analysis failed: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Perform snippet code audit
  const analyzeSnippet = async (code, language, filename) => {
    const token = localStorage.getItem("access_token");
    const storedKey = localStorage.getItem("mistral_api_key") || "";

    setLoading(true);
    clearAnalysis();

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

      loadAnalysisData(response.data);

    } catch (error) {
      console.error(error);
      alert("Snippet analysis failed: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
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
  };

  // Click history item
  const handleLoadPreviousReview = (review) => {
    setReviewId(review.id);
    setCurrentFilename(review.project_name);
    setPylintResult(review.pylint_result || null);
    setSecurityResult(review.security_result || null);
    setComplexityResult(review.complexity_result || null);
    setAiResult(review.ai_analysis_result || null);
    setScore(review.review_score !== undefined ? review.review_score : 100);
    setSummary(review.summary || "");
    
    // Jump to dashboard to view detailed reports
    setActiveTab("dashboard");
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active view tab rendering logic
  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="page-header">
              <h1>Code Audit Dashboard</h1>
              <p>Analyze python files or snippets using static tools and Mistral AI reviews</p>
            </div>

            <div className="dashboard-grid">
              {/* Left Column: Snippet Editor */}
              <div className="card-panel">
                <CodeEditor analyzeSnippet={analyzeSnippet} loading={loading} />
              </div>

              {/* Right Column: File Upload box */}
              <div className="card-panel" style={{ height: "fit-content" }}>
                <div className="panel-title">
                  <FaCode />
                  File Upload
                </div>
                <UploadBox setFile={setFile} uploadFile={uploadFile} loading={loading} />
              </div>
            </div>

            {loading && (
              <div className="card-panel spinner-container">
                <div className="spinner"></div>
                <p>Auditing source code and generating reports...</p>
              </div>
            )}

            {!loading && pylintResult && (
              <div className="card-panel result-card" style={{ marginTop: "25px" }}>
                <div className="panel-title" style={{ justifyContent: "space-between" }}>
                  <span>📊 Review Audit Results: {currentFilename}</span>
                  {reviewId && (
                    <DownloadPDF
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

                {/* AI Documentation Panel */}
                {aiResult && aiResult.enabled && (
                  <div className="card-panel" style={{ marginTop: "25px", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
                    <AIDocViewer documentation={aiResult.documentation} />
                  </div>
                )}
              </div>
            )}

            <ProjectInfo />
          </>
        );

      case "history":
        return (
          <>
            <div className="page-header">
              <h1>Audits History Log</h1>
              <p>Search previous analysis files, filter by score rankings, and reload results onto dashboard</p>
            </div>
            <HistoryList onLoadReview={handleLoadPreviousReview} activeReviewId={reviewId} />
          </>
        );

      case "settings":
        return (
          <>
            <div className="page-header">
              <h1>Settings & Profile</h1>
              <p>Configure third-party LLM API keys and reset your profile password</p>
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
                    style={{ border: "1.5px solid var(--border-color)" }}
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
                    style={{ border: "1.5px solid var(--border-color)" }}
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
                    style={{ border: "1.5px solid var(--border-color)" }}
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
                    style={{ border: "1.5px solid var(--border-color)" }}
                    required
                  />
                </div>
                <button type="submit" className="btn-save">
                  Update Password
                </button>
              </form>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        username={username}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;
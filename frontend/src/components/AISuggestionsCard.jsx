import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { 
  FaRocket, FaShieldAlt, FaLightbulb, FaChevronDown, FaChevronUp, 
  FaCopy, FaCheck, FaExclamationTriangle, FaMagic, FaRegSmile 
} from "react-icons/fa";

function AISuggestionsCard({ 
  code, 
  pylint, 
  security, 
  complexity, 
  token,
  aiSuggestions: propsSuggestions,
  loading: propsLoading,
  error: propsError,
  onRetry
}) {
  const [localSuggestions, setLocalSuggestions] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [expandedIssue, setExpandedIssue] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const isControlled = propsSuggestions !== undefined || propsLoading !== undefined;

  const suggestions = isControlled ? propsSuggestions : localSuggestions;
  const loading = isControlled ? propsLoading : localLoading;
  const error = isControlled ? propsError : localError;

  const hasAnalysis = pylint !== null && pylint !== undefined;

  const generateSuggestions = async () => {
    const finalCode = code || localStorage.getItem("last_analyzed_code") || "";
    if (!finalCode) {
      setLocalError("No code content available to analyze. Please audit some code first.");
      return;
    }

    setLocalLoading(true);
    setLocalError("");
    setLocalSuggestions(null);

    const storedKey = localStorage.getItem("mistral_api_key") || "";

    const makeRequest = async () => {
      return await axios.post(
        `${API_BASE_URL}/ai-suggestions`,
        {
          code: finalCode,
          pylint,
          security,
          complexity
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-Mistral-API-Key": storedKey
          }
        }
      );
    };

    try {
      try {
        const response = await makeRequest();
        setLocalSuggestions(response.data);
      } catch (firstErr) {
        console.warn("First local attempt failed, retrying once...", firstErr);
        const response = await makeRequest();
        setLocalSuggestions(response.data);
      }
    } catch (err) {
      console.error(err);
      setLocalError(err.response?.data?.error || "Failed to generate AI Suggestions. Please verify your Mistral API Key and try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAction = () => {
    if (isControlled && onRetry) {
      onRetry();
    } else {
      generateSuggestions();
    }
  };

  const toggleIssue = (index) => {
    setExpandedIssue(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Friendly placeholder if no analysis exists
  if (!hasAnalysis && !localStorage.getItem("last_analyzed_code")) {
    return (
      <div className="card-panel ai-suggestions-main-card" style={{ marginTop: "25px", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
        <div className="panel-title ai-title-gradient">
          <FaMagic /> AI Explanation & Fix Suggestions
        </div>
        <div className="ai-cta-container">
          <p className="ai-cta-desc" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
            Please write a code snippet or upload a file first to run a code review and view AI explanations & fix suggestions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-panel ai-suggestions-main-card" style={{ marginTop: "25px", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
      <div className="panel-title ai-title-gradient">
        <FaMagic /> AI Explanation & Fix Suggestions
      </div>

      {/* State 1: Call to Action to Generate */}
      {!suggestions && !loading && !error && (
        <div className="ai-cta-container">
          <p className="ai-cta-desc">
            Get personalized explanations and refactored code fixes directly from the AI model. 
            We will analyze your code, Pylint warnings, Bandit safety scan, and Radon complexity to provide clean, optimized suggestions.
          </p>
          <button className="btn-ai-generate" onClick={handleAction}>
            <FaRocket /> Generate AI Suggestions
          </button>
        </div>
      )}

      {/* State 2: Loading State */}
      {loading && (
        <div className="ai-loading-container">
          <div className="ai-pulse-ring">
            <FaMagic className="ai-loading-icon" />
          </div>
          <div className="ai-loading-title">Antigravity AI is Auditing Your Code...</div>
          <p className="ai-loading-subtitle">Reviewing syntax, structural patterns, security vulnerabilities, and code metrics.</p>
        </div>
      )}

      {/* State 3: Error State */}
      {error && (
        <div className="ai-error-container">
          <FaExclamationTriangle className="ai-error-icon" />
          <div className="ai-error-message">{error}</div>
          <button className="btn-ai-retry" onClick={handleAction}>
            Retry Suggestions
          </button>
        </div>
      )}

      {/* State 4: Suggestions Loaded */}
      {suggestions && !loading && (
        <div className="ai-results-wrapper">
          {/* Estimated Quality Improvements */}
          {suggestions.estimated_quality_after && (
            <div className="ai-badge-quality-score">
              <FaRegSmile className="quality-icon" />
              <span>{suggestions.estimated_quality_after}</span>
            </div>
          )}

          {/* Code Summary */}
          {suggestions.summary && (
            <div className="ai-section-box">
              <h4 className="ai-section-subtitle">📝 Code Summary</h4>
              <p className="ai-summary-text">{suggestions.summary}</p>
            </div>
          )}

          {/* AI Explanations & Fixes (Collapsible) */}
          {suggestions.explanations && suggestions.explanations.length > 0 && (
            <div className="ai-section-box">
              <h4 className="ai-section-subtitle">💡 Code Issues & Fixes</h4>
              <div className="ai-accordion-list">
                {suggestions.explanations.map((item, index) => (
                  <div key={index} className={`ai-accordion-item ${expandedIssue[index] ? 'open' : ''}`}>
                    <div className="ai-accordion-header" onClick={() => toggleIssue(index)}>
                      <div className="ai-header-main">
                        <span className={`tool-badge ${item.tool?.toLowerCase() || 'general'}`}>{item.tool || 'General'}</span>
                        <span className="ai-issue-title">
                          {item.issue} {item.line !== undefined && item.line !== null && `(Line ${item.line})`}
                        </span>
                      </div>
                      <span className="ai-arrow-icon">
                        {expandedIssue[index] ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </div>

                    {expandedIssue[index] && (
                      <div className="ai-accordion-body">
                        <div className="ai-explanation-text">
                          <strong>Explanation:</strong> {item.explanation}
                        </div>
                        {item.fix_suggestion && (
                          <div className="ai-suggestion-text">
                            <strong>Recommendation:</strong> {item.fix_suggestion}
                          </div>
                        )}
                        {item.improved_code && (
                          <div className="ai-code-comparison">
                            <div className="comparison-header">
                              <span>Refactored Code Example</span>
                              <button 
                                className="btn-copy-code" 
                                onClick={() => copyToClipboard(item.improved_code, index)}
                              >
                                {copiedIndex === index ? <><FaCheck /> Copied</> : <><FaCopy /> Copy Code</>}
                              </button>
                            </div>
                            <pre className="comparison-code-block">
                              <code>{item.improved_code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Practices */}
          {suggestions.best_practices && suggestions.best_practices.length > 0 && (
            <div className="ai-section-box">
              <h4 className="ai-section-subtitle">🚀 Best Practices & Optimizations</h4>
              <ul className="ai-bullet-list">
                {suggestions.best_practices.map((tip, idx) => (
                  <li key={idx}>
                    <FaLightbulb className="bullet-icon best-practice" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Security Recommendations */}
          {suggestions.security_recommendations && suggestions.security_recommendations.length > 0 && (
            <div className="ai-section-box">
              <h4 className="ai-section-subtitle">🛡️ Security Recommendations</h4>
              <ul className="ai-bullet-list">
                {suggestions.security_recommendations.map((tip, idx) => (
                  <li key={idx}>
                    <FaShieldAlt className="bullet-icon security-practice" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Quick Regenerate Action */}
          <div className="ai-footer-actions">
            <button className="btn-ai-regenerate" onClick={handleAction}>
              <FaMagic /> Regenerate Fixes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AISuggestionsCard;

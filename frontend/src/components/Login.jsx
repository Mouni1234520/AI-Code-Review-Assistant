import React, { useState } from "react";
import axios from "axios";
import Register from "./Register";
import "./Auth.css";

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showRegister, setShowRegister] = useState(false);
    
    // Forgot password states
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [devResetLink, setDevResetLink] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/login",
                {
                    username,
                    email,
                    password
                }
            );

            // Store token in localStorage
            localStorage.setItem("access_token", response.data.access_token);
            localStorage.setItem("user_id", response.data.user_id);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("email", response.data.email);

            // Call the callback to update parent component
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMsg("");
        setDevResetLink("");

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/forgot-password",
                { email: forgotEmail }
            );
            setSuccessMsg(response.data.message);
            if (response.data.dev_reset_link) {
                setDevResetLink(response.data.dev_reset_link);
            }
            setForgotEmail("");
        } catch (err) {
            setError(err.response?.data?.error || "Request failed");
        } finally {
            setLoading(false);
        }
    };

    if (forgotMode) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h1>🔑 Forgot Password</h1>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "15px", textAlign: "center" }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {error && <div className="error-message">{error}</div>}
                    {successMsg && <div className="success-message">{successMsg}</div>}
                    {devResetLink && (
                        <div className="info-message" style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid var(--primary)", padding: "10px", borderRadius: "6px", margin: "10px 0", wordBreak: "break-all", fontSize: "12px" }}>
                            <strong>[Dev Mode] Use this reset link:</strong>
                            <br />
                            <a href={devResetLink} style={{ color: "var(--primary)", textDecoration: "underline" }}>{devResetLink}</a>
                        </div>
                    )}

                    <form onSubmit={handleForgotPassword}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Sending link..." : "Send Reset Link"}
                        </button>
                    </form>

                    <p className="toggle-auth">
                        <button
                            className="link-button"
                            onClick={() => {
                                setForgotMode(false);
                                setError("");
                                setSuccessMsg("");
                                setDevResetLink("");
                            }}
                        >
                            Back to Login
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🔐 Login</h1>
                
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="toggle-auth" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    <button
                        className="link-button"
                        style={{ fontSize: "13px", color: "var(--text-secondary)" }}
                        onClick={() => {
                            setForgotMode(true);
                            setError("");
                        }}
                    >
                        Forgot Password?
                    </button>
                    <span>
                        Don't have an account?{" "}
                        <button
                            className="link-button"
                            onClick={() => setShowRegister(true)}
                        >
                            Register here
                        </button>
                    </span>
                </p>
            </div>

            {showRegister && (
                <Register
                    onClose={() => setShowRegister(false)}
                    onRegisterSuccess={() => {
                        setShowRegister(false);
                        setError("");
                    }}
                />
            )}
        </div>
    );
}

export default Login;

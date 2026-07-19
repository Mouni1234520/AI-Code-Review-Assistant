import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Auth.css";
import { API_BASE_URL } from "../config";

function ResetPassword() {
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        // Parse token from URL query parameters
        const params = new URLSearchParams(window.location.search);
        const tok = params.get("token");
        if (tok) {
            setToken(tok);
        } else {
            setError("Reset token is missing or invalid. Please check your email link.");
        }
    }, []);

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!token) {
            setError("Reset token is missing. Cannot reset password.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/reset-password`,
                {
                    token,
                    password
                }
            );

            setSuccess("Password has been reset successfully! Redirecting to Login...");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                window.location.href = "/";
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.error || "Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🔒 Reset Password</h1>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {!success && token && (
                    <form onSubmit={handleReset}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password (min. 6 characters)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Resetting password..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <p className="toggle-auth">
                    <button
                        className="link-button"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        Back to Login
                    </button>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;

import React, { useState } from "react";
import axios from "axios";
import Register from "./Register";
import "./Auth.css";

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showRegister, setShowRegister] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/login",
                {
                    username,
                    password
                }
            );

            // Store token in localStorage
            localStorage.setItem("access_token", response.data.access_token);
            localStorage.setItem("user_id", response.data.user_id);
            localStorage.setItem("username", response.data.username);

            // Call the callback to update parent component
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

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

                <p className="toggle-auth">
                    Don't have an account?{" "}
                    <button
                        className="link-button"
                        onClick={() => setShowRegister(true)}
                    >
                        Register here
                    </button>
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

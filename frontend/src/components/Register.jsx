import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

function Register({ onClose, onRegisterSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

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
                "http://127.0.0.1:5000/register",
                {
                    username,
                    password
                }
            );

            console.log("Registration Success:", response.data);

            setSuccess("Registration successful! You can now login.");
            setUsername("");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }

                if (onClose) {
                    onClose();
                }
            }, 2000);

        } catch (err) {

            console.log("Full Error:", err);

            if (err.response) {
                console.log("Status:", err.response.status);
                console.log("Data:", err.response.data);

                setError(
                    err.response.data.error ||
                    JSON.stringify(err.response.data)
                );

            } else if (err.request) {

                console.log("No response received:", err.request);
                setError("Cannot connect to Flask server.");

            } else {

                console.log("Axios Error:", err.message);
                setError(err.message);

            }

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="close-button"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2>📝 Create Account</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister}>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Choose a username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            placeholder="Repeat your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Register;
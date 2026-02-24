import React, { useState } from "react";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./AuthPages.css";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
        if (serverError) setServerError("");
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setServerError("");

        try {
            const response = await authService.loginUser(formData);

            if (response.success && response.token) {
                if (rememberMe) {
                    localStorage.setItem("token", response.token);
                    localStorage.setItem("role", response.user?.role || 'user');
                } else {
                    sessionStorage.setItem("token", response.token);
                    sessionStorage.setItem("role", response.user?.role || 'user');
                }

                login(response.token, response.user);
                navigate("/");
            } else {
                setServerError(response.message || "Login failed");
            }
        } catch (error) {
            setServerError(error.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page container-fluid">

            {/* Right Side - Login Form Section */}
            <div className="auth-form-section">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Login</h2>
                        <p>Welcome back! Please enter your details</p>
                    </div>

                    {serverError && (
                        <div className="alert alert-error">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                                <circle cx="12" cy="16" r="1" fill="currentColor" />
                            </svg>
                            <span>{serverError}</span>
                            <button onClick={() => setServerError("")} className="alert-close">×</button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form h-50">
                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" strokeWidth="2" />
                                    <path d="M22 6L12 13L2 6" strokeWidth="2" />
                                </svg>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={errors.email ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <div className="password-header">
                                <label htmlFor="password">
                                    Password <span className="required">*</span>
                                </label>
                                <Link to="/forgot-password" className="forgot-link">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                                    <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" strokeWidth="2" />
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={errors.password ? 'error' : ''}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path
                                                d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12C1.62 10.61 2.53 9.39 3.65 8.35M9.9 4.24A10.94 10.94 0 0 1 12 4C17 4 21.27 7.89 23 12C22.47 13.2 21.73 14.29 20.82 15.24M1 1L23 23"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path
                                                d="M1 12C3 7 7 4 12 4C17 4 21 7 23 12C21 17 17 20 12 20C7 20 3 17 1 12Z"
                                                strokeWidth="2"
                                            />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-options">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                />
                                <span className="checkbox-label">Remember me</span>
                            </label>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>

                        <div className="form-footer">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/register" className="toggle-link">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
}

export default LoginPage; 
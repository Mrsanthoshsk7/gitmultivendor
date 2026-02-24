import React, { useState } from "react";
import Login from "./loginform";
import Register from "./registerform";

function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");

    const handleToggleForm = () => {
        setIsLogin(!isLogin);
        setMessage("");
    };

    const handleRegisterSuccess = (successMessage) => {
        setMessage(successMessage);
        setIsLogin(true);
    };

    return (
        <div className="auth-container">
            {isLogin ? (
                <Login
                    onLoginSuccess={onLoginSuccess}
                    onToggleForm={handleToggleForm}
                    error={message}
                />
            ) : (
                <Register
                    onRegisterSuccess={handleRegisterSuccess}
                    onToggleForm={handleToggleForm}
                    error={message}
                />
            )}
        </div>
    );
}

export default Auth;
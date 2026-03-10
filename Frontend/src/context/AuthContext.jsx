import React, { useState, useEffect, useContext, createContext } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await authService.getCurrentUser();
                    if (response.success) {
                        setUser(response.user);
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    setToken(null);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const refreshUser = async () => {
        if (token) {
            try {
                const response = await authService.getCurrentUser();
                if (response.success) {
                    setUser(response.user);
                }
            } catch (error) {
                console.error("Auth refresh failed:", error);
            }
        }
    };

    const login = (token, userData = null) => {
        setToken(token);
        if (userData) {
            setUser(userData);
        }
        localStorage.setItem("token", token);
    };

    const register = (token, userData = null) => {
        setToken(token);
        if (userData) {
            setUser(userData);
        }
        localStorage.setItem("token", token);
    };

    const logout = () => {
        authService.logoutUser();
        setUser(null);
        setToken(null);
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await authService.updateProfile(profileData);
            if (response.success) {
                setUser(response.user);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Update failed",
            };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateProfile,
                refreshUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

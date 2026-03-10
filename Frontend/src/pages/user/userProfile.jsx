import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function UserProfile() {
    const { user, updateProfile } = useAuth();
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
        avatar: "",
        address: {},
    });
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                avatar: user.avatar || "",
                address: user.address || {},
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value,
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(profileData);
            alert("Profile updated!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/change-password`, {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });
            alert("Password changed!");
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Error changing password:", error);
            alert(error.response?.data?.message || "Error changing password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4">My Profile</h1>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")} style={{ color: "black" }}
                    >
                        Profile
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "password" ? "active" : ""}`}
                        onClick={() => setActiveTab("password")}
                    >
                        Change Password
                    </button>
                </li>
            </ul>

            {
                activeTab === "profile" && (
                    <div className="row">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-body">
                                    <form onSubmit={handleProfileSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label border-dark">Name</label>
                                            <input
                                                type="text"
                                                className="form-control border-dark"
                                                name="name"
                                                value={profileData.name}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control border-dark"
                                                value={profileData.email}
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control border-dark"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleProfileChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Avatar URL</label>
                                            <input
                                                type="url"
                                                className="form-control border-dark"
                                                name="avatar"
                                                value={profileData.avatar}
                                                onChange={handleProfileChange}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? "Updating..." : "Update Profile"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeTab === "password" && (
                    <div className="row">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-body">
                                    <form onSubmit={handlePasswordSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Old Password</label>
                                            <input
                                                type="password"
                                                className="form-control border-dark"
                                                name="oldPassword"
                                                value={passwordForm.oldPassword}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">New Password</label>
                                            <input
                                                type="password"
                                                className="form-control border-dark"
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Confirm Password</label>
                                            <input
                                                type="password"
                                                className="form-control border-dark"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? "Changing..." : "Change Password"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default UserProfile;

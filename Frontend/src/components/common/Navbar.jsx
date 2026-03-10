import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery}`);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
            <div className="container-fluid">
                {/* Brand */}
                <Link className="navbar-brand fw-bold" to="/">
                    MultiVendor
                </Link>

                {/* Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Content */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    {/* Center Search */}
                    <form className="d-flex mx-auto my-2 my-lg-0 flex-grow-1 me-3" onSubmit={handleSearch}>
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-outline-light" type="submit">
                            Search
                        </button>
                    </form>

                    {/* Right Side Navigation */}
                    <ul className="navbar-nav ms-auto">
                        {/* Products Link */}
                        {!isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                {/* Cart for Users */}
                                {user?.role === "user" && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/cart">
                                                🛒
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/favorites">
                                                ❤️
                                            </Link>
                                        </li>
                                    </>
                                )}

                                {/* Vendor Dashboard */}
                                {user?.role === "vendor" && (
                                    <li className="nav-item dropdown">
                                        <a
                                            className="nav-link dropdown-toggle"
                                            href="#!"
                                            id="vendorDropdown"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            Vendor
                                        </a>
                                        <ul className="dropdown-menu" aria-labelledby="vendorDropdown">
                                            <li>
                                                <Link className="dropdown-item" to="/vendor/dashboard">
                                                    Dashboard
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/vendor/products">
                                                    My Products
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/vendor/orders">
                                                    My Orders
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/vendor/analytics">
                                                    Analytics
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/vendor/profile">
                                                    Profile
                                                </Link>
                                            </li>
                                        </ul>
                                    </li>
                                )}

                                {/* Admin Dashboard */}
                                {user?.role === "admin" && (
                                    <li className="nav-item dropdown">
                                        <a
                                            className="nav-link dropdown-toggle"
                                            href="#!"
                                            id="adminDropdown"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            Admin
                                        </a>
                                        <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                                            <li>
                                                <Link className="dropdown-item" to="/admin/dashboard">
                                                    Dashboard
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/admin/vendors">
                                                    Vendors
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/admin/products">
                                                    Products
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/admin/categories">
                                                    Categories
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/admin/users">
                                                    Users
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/admin/analytics">
                                                    Analytics
                                                </Link>
                                            </li>
                                        </ul>
                                    </li>
                                )}

                                {/* User Dropdown */}
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#!"
                                        id="userDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        👤 {user?.name}
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="userDropdown">
                                        {user?.role === "user" && (
                                            <>
                                                <li>
                                                    <Link className="dropdown-item" to="/profile">
                                                        My Profile
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link className="dropdown-item" to="/orders">
                                                        My Orders
                                                    </Link>
                                                </li>
                                            </>
                                        )}
                                        <li>
                                            <hr className="dropdown-divider" />
                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

import React, { useEffect, useState } from "react";
import axios from "axios";

function VendorDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchStats();
    }, [API_URL]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/vendors/dashboard/stats`);
            setStats(res.data.stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    return (
        <div className="container-fluid py-5">
            <h1 className="mb-4">Vendor Dashboard</h1>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Total Products</h6>
                            <h2 className="card-text text-primary">{stats?.totalProducts || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Total Orders</h6>
                            <h2 className="card-text text-success">{stats?.totalOrders || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Total Revenue</h6>
                            <h2 className="card-text text-info">₹{(stats?.totalRevenue || 0).toFixed(2)}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Rating</h6>
                            <h2 className="card-text text-warning">
                                ⭐ {(stats?.rating || 0).toFixed(1)}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="list-group">
                                <a href="/vendor/products" className="list-group-item list-group-item-action">
                                    → Manage Products
                                </a>
                                <a href="/vendor/orders" className="list-group-item list-group-item-action">
                                    → View Orders
                                </a>
                                <a href="/vendor/profile" className="list-group-item list-group-item-action">
                                    → Edit Profile
                                </a>
                                <a href="/vendor/analytics" className="list-group-item list-group-item-action">
                                    → View Analytics
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">Recent Stats</h5>
                        </div>
                        <div className="card-body">
                            <p>
                                <strong>Total Reviews:</strong> {stats?.totalReviews || 0}
                            </p>
                            <p>
                                <strong>Pending Approval:</strong> {stats?.pendingApproval || 0} products
                            </p>
                            <p>
                                <strong>Account Status:</strong>{" "}
                                <span className="badge bg-success">Active</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VendorDashboard;

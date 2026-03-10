import React, { useEffect, useState } from "react";
import { getAnalytics } from "../../services/adminService";

function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await getAnalytics();
            setAnalytics(res.data.analytics);
        } catch (error) {
            console.error("Error fetching analytics:", error);
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
            <h1 className="mb-4">Admin Dashboard</h1>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Total Users</h6>
                            <h2 className="card-text text-primary">{analytics?.totalUsers || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Total Vendors</h6>
                            <h2 className="card-text text-success">{analytics?.totalVendors || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Total Products</h6>
                            <h2 className="card-text text-info">{analytics?.totalProducts || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Total Orders</h6>
                            <h2 className="card-text text-warning">{analytics?.totalOrders || 0}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Total Revenue</h6>
                            <h2 className="card-text text-danger">₹{(analytics?.totalRevenue || 0).toFixed(2)}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Pending Orders</h6>
                            <h2 className="card-text text-secondary">{analytics?.pendingOrders || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Pending Approvals</h6>
                            <h2 className="card-text text-muted">{analytics?.pendingApprovals || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h6 className="card-title text-muted">Approved Vendors</h6>
                            <h2 className="card-text text-primary">{analytics?.approvedVendors || 0}</h2>
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
                                <a href="/admin/orders" className="list-group-item list-group-item-action">
                                    → Manage Orders
                                </a>
                                <a href="/admin/vendors" className="list-group-item list-group-item-action">
                                    → Manage Vendors
                                </a>
                                <a href="/admin/products" className="list-group-item list-group-item-action">
                                    → Approve Products
                                </a>
                                <a href="/admin/categories" className="list-group-item list-group-item-action">
                                    → Manage Categories
                                </a>
                                <a href="/admin/users" className="list-group-item list-group-item-action">
                                    → View Users
                                </a>
                                <a href="/admin/analytics" className="list-group-item list-group-item-action">
                                    → View Analytics
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">Top Vendors</h5>
                        </div>
                        <div className="card-body">
                            {analytics?.topVendors && analytics.topVendors.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {analytics?.topVendors?.slice(0, 5).map((vendor, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between">
                                            <span>{vendor?.storeName || "Unknown Vendor"}</span>
                                            <span>₹{(vendor?.totalRevenue || 0).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No vendor data</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

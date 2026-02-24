import React, { useEffect, useState } from "react";
import { getAnalytics, getRevenueAnalytics } from "../../services/adminService";

function AdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [analyticsRes, revenueRes] = await Promise.all([
                getAnalytics(),
                getRevenueAnalytics(),
            ]);
            setAnalytics({
                ...analyticsRes.data.analytics,
                revenue: revenueRes.data,
            });
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
            <h1 className="mb-4">Advanced Analytics</h1>

            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Monthly Revenue</h5>
                        </div>
                        <div className="card-body">
                            <p>Monthly revenue chart would display here using Chart.js</p>
                            {analytics?.revenue?.monthlyRevenue && (
                                <ul className="list-group">
                                    {analytics.revenue.monthlyRevenue.slice(0, 5).map((data, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between">
                                            <span>Month {idx + 1}</span>
                                            <strong>₹{data.revenue.toFixed(2)}</strong>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">Top Products</h5>
                        </div>
                        <div className="card-body">
                            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {analytics.topProducts.slice(0, 5).map((product, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between">
                                            <span>{product?.name || "Unknown Product"}</span>
                                            <span className="badge bg-warning">{product?.count || 0}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No top products data</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Top Vendors by Revenue</h5>
                        </div>
                        <div className="card-body">
                            {analytics?.topVendors && analytics.topVendors.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {analytics.topVendors.slice(0, 5).map((vendor, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between">
                                            <span>{vendor?.vendor?.storeName || vendor?.storeName || "Unknown"}</span>
                                            <strong>₹{(vendor?.totalRevenue || 0).toFixed(2)}</strong>
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

            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">Vendor Revenue Breakdown</h5>
                        </div>
                        <div className="card-body">
                            {analytics?.revenue?.vendorRevenue && analytics.revenue.vendorRevenue.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Vendor</th>
                                                <th>Revenue</th>
                                                <th>Commission (10%)</th>
                                                <th>Net Payment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.revenue.vendorRevenue.slice(0, 10).map((vendor, idx) => (
                                                <tr key={idx}>
                                                    <td>{vendor?.vendor?.storeName || "Unknown"}</td>
                                                    <td>₹{(vendor?.totalRevenue || 0).toFixed(2)}</td>
                                                    <td>₹{((vendor?.totalRevenue || 0) * 0.1).toFixed(2)}</td>
                                                    <td>₹{((vendor?.totalRevenue || 0) * 0.9).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p>No vendor revenue data</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;

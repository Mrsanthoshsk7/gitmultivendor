import React from "react";

function VendorAnalytics() {
    return (
        <div className="container-fluid py-5">
            <h1 className="mb-4">Your Analytics</h1>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Sales Overview</h5>
                        </div>
                        <div className="card-body">
                            <p>Monthly Revenue Chart</p>
                            <p className="text-muted">[Chart would display here with Chart.js or Recharts]</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">Top Selling Products</h5>
                        </div>
                        <div className="card-body">
                            <p>Top products by sales volume</p>
                            <p className="text-muted">[Table would display here]</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header bg-info text-white">
                    <h5 className="mb-0">Customer Reviews</h5>
                </div>
                <div className="card-body">
                    <p>Customer review analytics and feedback</p>
                    <p className="text-muted">[Analytics would display here]</p>
                </div>
            </div>
        </div>
    );
}

export default VendorAnalytics;

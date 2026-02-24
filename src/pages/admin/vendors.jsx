import React, { useEffect, useState } from "react";
import { getVendors, approveVendor } from "../../services/adminService";

function AdminVendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendor, setSelectedVendor] = useState(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await getVendors();
            setVendors(res.data.vendors || []);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (vendorId) => {
        try {
            await approveVendor(vendorId, { isApproved: true });
            alert("Vendor approved!");
            fetchVendors();
        } catch (error) {
            console.error("Error approving vendor:", error);
        }
    };

    const handleReject = async (vendorId) => {
        const reason = window.prompt("Enter rejection reason:");
        if (reason) {
            try {
                await approveVendor(vendorId, {
                    isApproved: false,
                    rejectionReason: reason,
                });
                alert("Vendor rejected!");
                fetchVendors();
            } catch (error) {
                console.error("Error rejecting vendor:", error);
            }
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
            <h1 className="mb-4">Manage Vendors</h1>

            <div className="row">
                {vendors.length > 0 ? (
                    vendors.map((vendor) => (
                        <div key={vendor._id} className="col-md-4 mb-4">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{vendor.storeName}</h5>
                                    <p className="card-text text-muted small">{vendor.user.email}</p>
                                    <p className="card-text">{vendor.description}</p>

                                    <div className="mb-3">
                                        <p className="mb-1">
                                            <strong>Status:</strong>{" "}
                                            {vendor.isApproved ? (
                                                <span className="badge bg-success">Approved</span>
                                            ) : (
                                                <span className="badge bg-warning">Pending</span>
                                            )}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Revenue:</strong> ₹{(vendor.totalRevenue || 0).toFixed(2)}
                                        </p>
                                        <p className="mb-0">
                                            <strong>Rating:</strong> ⭐ {(vendor.rating || 0).toFixed(1)}
                                        </p>
                                    </div>

                                    {!vendor.isApproved && (
                                        <div className="btn-group w-100">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleApprove(vendor._id)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleReject(vendor._id)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center">
                        <p>No vendors</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminVendors;

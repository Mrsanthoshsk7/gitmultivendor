import React, { useEffect, useState } from "react";
import { vendorService } from "../../services/vendorService";
import { useAuth } from "../../context/AuthContext";

function VendorProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        storeName: "",
        description: "",
        logo: "",
        bankAccount: "",
        bankCode: "",
        accountHolder: "",
    });

    const { refreshUser } = useAuth();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await vendorService.getVendorProfile();
            setProfile(res.vendor);
            setFormData({
                storeName: res.vendor.storeName,
                description: res.vendor.storeDescription || "",
                logo: res.vendor.storeLogo || "",
                bankAccount: res.vendor.bankDetails?.accountNumber || "",
                bankCode: res.vendor.bankDetails?.ifscCode || "", // Backend uses ifscCode
                accountHolder: res.vendor.bankDetails?.accountHolder || "",
            });
            // Refresh auth context to update approval status
            await refreshUser();
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchProfile();
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await vendorService.updateVendorProfile({
                storeDescription: formData.description,
                storeLogo: formData.logo,
                bankDetails: {
                    accountNumber: formData.bankAccount,
                    ifscCode: formData.bankCode,
                    accountHolder: formData.accountHolder,
                },
            });
            alert("Profile updated!");
            fetchProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile: " + (error.message || "Something went wrong"));
        }
    };

    if (loading)
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Store Profile</h1>
                <button className="btn btn-outline-primary" onClick={handleRefresh} disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <h5 className="mb-3">Store Information</h5>
                                <div className="mb-3">
                                    <label className="form-label">Store Name</label>
                                    <input
                                        type="text"
                                        className="form-control 2"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        required
                                        disabled={!profile?.isApproved}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        disabled={!profile?.isApproved}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Logo URL</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        name="logo"
                                        value={formData.logo}
                                        onChange={handleChange}
                                        disabled={!profile?.isApproved}
                                    />
                                </div>

                                <h5 className="mb-3 mt-4">Bank Details</h5>
                                <div className="mb-3">
                                    <label className="form-label">Account Holder Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="accountHolder"
                                        value={formData.accountHolder}
                                        onChange={handleChange}
                                        disabled={!profile?.isApproved}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Account Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="bankAccount"
                                        value={formData.bankAccount}
                                        onChange={handleChange}
                                        disabled={!profile?.isApproved}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Bank Code (IFSC)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="bankCode"
                                        value={formData.bankCode}
                                        onChange={handleChange}
                                        disabled={!profile?.isApproved}
                                    />
                                </div>

                                {profile?.isApproved ? (
                                    <button type="submit" className="btn btn-primary">
                                        Update Profile
                                    </button>
                                ) : (
                                    <div className="alert alert-warning">
                                        <strong>Pending Approval:</strong> Your profile is under review. You can update your details once approved.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5>Store Status</h5>
                            <p>
                                <strong>Status:</strong>{" "}
                                {profile?.isApproved ? (
                                    <span className="badge bg-success">Approved</span>
                                ) : (
                                    <span className="badge bg-warning">Pending Approval</span>
                                )}
                            </p>
                            <p>
                                <strong>Commission:</strong> {profile?.commission || 10}%
                            </p>
                            <p>
                                <strong>Total Earnings:</strong> ₹{(profile?.totalEarnings || 0).toFixed(2)}
                            </p>
                            <p>
                                <strong>Rating:</strong> ⭐ {(profile?.rating || 0).toFixed(1)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VendorProfile;

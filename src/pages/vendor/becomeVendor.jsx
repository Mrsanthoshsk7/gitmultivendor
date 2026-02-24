import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorService } from "../../services/vendorService";
import { useAuth } from "../../context/AuthContext";

const BecomeVendor = () => {
    const [formData, setFormData] = useState({
        storeName: "",
        storeDescription: "",
        bankDetails: {
            accountHolder: "",
            accountNumber: "",
            ifscCode: ""
        }
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // To refresh user data if needed
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await vendorService.registerVendor(formData);
            setSuccess(response.message || "Vendor registration submitted successfully!");
            // Optionally refresh user context to reflect role change if immediate
            // But usually requires re-login or fetching user profile again
            setTimeout(() => {
                navigate("/vendor/dashboard");
                window.location.reload(); // Refresh to update role in context
            }, 2000);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4 fw-bold">Become a Vendor</h2>
                            <p className="text-center text-muted mb-4">
                                Start selling your products on our platform today!
                            </p>

                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="storeName" className="form-label">Store Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="storeName"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your store name"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="storeDescription" className="form-label">Store Description</label>
                                    <textarea
                                        className="form-control"
                                        id="storeDescription"
                                        name="storeDescription"
                                        value={formData.storeDescription}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Tell us about your store..."
                                    ></textarea>
                                </div>

                                <h5 className="mt-4 mb-3">Bank Details</h5>
                                <div className="mb-3">
                                    <label htmlFor="accountHolder" className="form-label">Account Holder Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="accountHolder"
                                        name="bankDetails.accountHolder"
                                        value={formData.bankDetails.accountHolder}
                                        onChange={handleChange}
                                        placeholder="Name on bank account"
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="accountNumber" className="form-label">Account Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="accountNumber"
                                            name="bankDetails.accountNumber"
                                            value={formData.bankDetails.accountNumber}
                                            onChange={handleChange}
                                            placeholder="Your account number"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="ifscCode" className="form-label">IFSC Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="ifscCode"
                                            name="bankDetails.ifscCode"
                                            value={formData.bankDetails.ifscCode}
                                            onChange={handleChange}
                                            placeholder="Bank IFSC Code"
                                        />
                                    </div>
                                </div>

                                <div className="d-grid gap-2 mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? "Registering..." : "Register as Vendor"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomeVendor;

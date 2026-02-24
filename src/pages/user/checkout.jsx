import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        paymentMethod: "Razorpay",
    });
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchCart();
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            const res = await api.get("/cart");
            setCart(res.data.cart);
        } catch (err) {
            console.error("Error fetching cart:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            // POST /api/orders/create with Bearer token (api instance handles auth)
            const res = await api.post("/orders/create", {
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    phone: formData.phone,
                },
                paymentMethod: formData.paymentMethod,
            });

            if (formData.paymentMethod === "COD") {
                navigate("/order-confirmed", { state: { order: res.data.order } });
            } else {
                navigate("/payment", { state: { order: res.data.order } });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error creating order. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );

    if (!cart || !cart.items || cart.items.length === 0)
        return (
            <div className="container py-5 text-center">
                <i className="bi bi-cart-x fs-1 text-muted"></i>
                <h4 className="mt-3">Your cart is empty</h4>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/products")}>
                    Browse Products
                </button>
            </div>
        );

    const subtotal = cart.items?.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) || 0;
    const tax = subtotal * 0.18;
    const shipping = 50;
    const total = subtotal + tax + shipping;

    return (
        <div className="container py-5">
            <h1 className="mb-4">
                <i className="bi bi-bag-check me-2"></i>Checkout
            </h1>

            {error && (
                <div className="alert alert-danger alert-dismissible" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
            )}

            <div className="row">
                <div className="col-lg-8">
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-geo-alt me-2"></i>Shipping Address
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit} id="checkout-form">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-semibold">Street Address *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            placeholder="House/Flat No., Street, Area"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">City *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">State *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            placeholder="State"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Postal Code *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            required
                                            placeholder="PIN Code"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Country *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            required
                                            placeholder="Country"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Phone *</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="10-digit phone number"
                                        />
                                    </div>
                                </div>

                                <h5 className="mt-4 mb-3">
                                    <i className="bi bi-credit-card me-2"></i>Payment Method
                                </h5>
                                <div className="mb-3">
                                    {[
                                        { value: "Razorpay", label: "Razorpay", icon: "bi-credit-card" },
                                        { value: "COD", label: "Cash on Delivery", icon: "bi-cash-coin" },
                                        { value: "CARD", label: "Card Payment", icon: "bi-credit-card" },
                                    ].map((method) => (
                                        <div className="form-check mb-2" key={method.value}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.value}
                                                checked={formData.paymentMethod === method.value}
                                                onChange={handleChange}
                                                id={`pay-${method.value}`}
                                            />
                                            <label className="form-check-label" htmlFor={`pay-${method.value}`}>
                                                <i className={`bi ${method.icon} me-2`}></i>
                                                {method.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-100 mt-2"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            Placing Order...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-bag-check me-2"></i>
                                            Place Order · ₹{total.toFixed(2)}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Order Summary</h5>
                        </div>
                        <div className="card-body">
                            {cart.items?.map((item) => (
                                <div key={item._id} className="d-flex justify-content-between mb-2">
                                    <small className="text-truncate me-2" style={{ maxWidth: "160px" }}>
                                        {item.product?.name || "Product"} × {item.quantity}
                                    </small>
                                    <small className="fw-semibold">₹{((item.price || 0) * item.quantity).toFixed(2)}</small>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">Tax (18% GST)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Shipping</span>
                                <span>₹{shipping.toFixed(2)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <h6 className="fw-bold">Total</h6>
                                <h6 className="fw-bold text-primary">₹{total.toFixed(2)}</h6>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={() => navigate("/cart")}
                        >
                            <i className="bi bi-arrow-left me-2"></i>Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;

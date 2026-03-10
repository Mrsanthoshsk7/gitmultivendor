import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import "./payment.css";

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const orderData = location.state?.order;
        if (!orderData) {
            navigate("/checkout");
            return;
        }

        setOrder(orderData);
        setLoading(false);

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => console.error('Failed to load Razorpay script');
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [user, navigate, location.state]);

    const handlePayment = async () => {
        if (!order || !razorpayLoaded) return;

        setProcessing(true);
        try {
            const orderResponse = await paymentService.createOrder(order._id);

            if (!orderResponse.success) {
                throw new Error(orderResponse.message || 'Failed to create order');
            }

            const { order: razorpayOrder, key } = orderResponse;

            const options = {
                key: key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'MultiVendor Mall',
                description: `Payment for Order #${order.orderNumber}`,
                image: 'https://images.unsplash.com/photo-1621416848446-991125208688?w=100&h=100&fit=crop', // Temporary premium-looking logo
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id,
                        });

                        if (verifyResponse.success) {
                            navigate('/order-confirmed', { state: { order: verifyResponse.payment.order } });
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || '',
                },
                notes: {
                    address: order.shippingAddress.address,
                    order_id: order._id
                },
                theme: {
                    color: '#007bff',
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment failed:", error);
            alert(error.message || "Payment failed. Please try again.");
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-container justify-content-center">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="payment-container">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="card payment-card">
                            <div className="card-header payment-header">
                                <i className="bi bi-shield-check fs-2 mb-2"></i>
                                <h4>SECURE CHECKOUT</h4>
                            </div>
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <div className="payment-icon">
                                        <i className="bi bi-wallet2"></i>
                                    </div>
                                    <div className="payment-method-badge mb-3">
                                        <i className="bi bi-lightning-fill me-1"></i> Powered by Razorpay
                                    </div>
                                </div>

                                <div className="order-summary-box">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Order Number</span>
                                        <span className="fw-bold text-dark">#{order.orderNumber}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Items</span>
                                        <span className="fw-bold text-dark">{order.orderItems?.length || 0} Products</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <span className="h5 mb-0">Total Amount</span>
                                        <span className="h5 mb-0 fw-bold text-primary">₹{(order.grandTotal || order.totalAmount).toLocaleString()}</span>
                                    </div>
                                </div>

                                {!razorpayLoaded && (
                                    <div className="loading-gate mb-3">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                        Initializing Secure Gateway...
                                    </div>
                                )}

                                <button
                                    className="btn btn-success w-100 pay-button mt-2"
                                    onClick={handlePayment}
                                    disabled={processing || !razorpayLoaded}
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Authorizing...
                                        </>
                                    ) : (
                                        <>Pay Securely Now</>
                                    )}
                                </button>

                                <p className="text-center text-muted mt-4 mb-0 small">
                                    <i className="bi bi-lock-fill me-1"></i>
                                    Your payment is encrypted and 100% secure
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Payment;

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OrderConfirmed() {
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="container py-5 text-center">
                <h4>Order not found</h4>
                <button className="btn btn-primary" onClick={() => navigate("/orders")}>
                    View Orders
                </button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card text-center">
                        <div className="card-body">
                            <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
                            <h2 className="card-title">Order Confirmed!</h2>
                            <p className="card-text">
                                Thank you for your purchase. Your order has been placed successfully.
                            </p>
                            <h5>Order #{order.orderNumber}</h5>
                            <p>Total: ₹{order.grandTotal || order.totalAmount}</p>

                            <div className="mt-4">
                                <button
                                    className="btn btn-primary me-2"
                                    onClick={() => navigate("/orders")}
                                >
                                    View Order Details
                                </button>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => navigate("/products")}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderConfirmed;
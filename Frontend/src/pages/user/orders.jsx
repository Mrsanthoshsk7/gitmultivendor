import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../../services/orderService";

function Orders() {
    const { orderId: id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = React.useCallback(async () => {
        try {
            const res = await orderService.getOrder(id);
            setOrder(res.order || null);
        } catch (error) {
            console.error("Error fetching order:", error);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchUserOrders = React.useCallback(async () => {
        try {
            const res = await orderService.getUserOrders();
            setOrder(res.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrder([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchOrder();
        } else {
            fetchUserOrders();
        }
    }, [id, fetchOrder, fetchUserOrders]);

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Cancel this order?")) {
            try {
                await orderService.cancelOrder(orderId);
                fetchOrder();
                alert("Order cancelled!");
            } catch (error) {
                console.error("Error cancelling order:", error);
            }
        }
    };

    if (loading)
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    // Single order detail view
    if (id && order)
        return (
            <div className="container py-5">
                <button className="btn btn-secondary mb-3" onClick={() => navigate("/orders")}>
                    ← Back to Orders
                </button>

                <div className="row">
                    <div className="col-lg-8">
                        <div className="card mb-3">
                            <div className="card-header">
                                <h5>Order #{order.orderNumber}</h5>
                            </div>
                            <div className="card-body">
                                <p>
                                    <strong>Status:</strong>{" "}
                                    <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </p>
                                <p>
                                    <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                                </p>

                                <h6 className="mt-4">Items</h6>
                                {order.orderItems.map((item) => (
                                    <div key={item._id} className="border-bottom pb-3 mb-3">
                                        <div className="row">
                                            <div className="col-md-2">
                                                <img
                                                    src={item.product.images?.[0]}
                                                    className="img-fluid"
                                                    alt={item.product.name}
                                                />
                                            </div>
                                            <div className="col-md-7">
                                                <h6>{item.product.name}</h6>
                                                <p className="text-muted small">{item.vendor?.storeName || "Unknown Vendor"}</p>
                                                <p>Qty: {item.quantity}</p>
                                            </div>
                                            <div className="col-md-3 text-end">
                                                <p>₹{(item.itemTotal).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <h6 className="mt-4">Shipping Address</h6>
                                <p>
                                    {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Order Total</h5>
                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <strong>₹{(order.totalAmount - order.taxAmount).toFixed(2)}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Tax:</span>
                                    <strong>₹{order.taxAmount.toFixed(2)}</strong>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <h6>Total:</h6>
                                    <h6>₹{order.totalAmount.toFixed(2)}</h6>
                                </div>
                                {["pending", "confirmed"].includes(order.orderStatus) && (
                                    <button
                                        className="btn btn-danger w-100"
                                        onClick={() => handleCancelOrder(order._id)}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

    // Orders list view
    return (
        <div className="container py-5">
            <h1 className="mb-4">My Orders</h1>

            {Array.isArray(order) && order.length > 0 ? (
                <div className="row">
                    {order.map((ord) => (
                        <div key={ord._id} className="col-lg-12 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-4">
                                            <h6>Order #{ord.orderNumber}</h6>
                                            <small className="text-muted">
                                                {new Date(ord.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div className="col-md-2">
                                            <span className={`badge bg-${getStatusColor(ord.orderStatus)}`}>
                                                {ord.orderStatus}
                                            </span>
                                        </div>
                                        <div className="col-md-2">
                                            <p className="mb-0">₹{ord.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div className="col-md-2">
                                            <button
                                                className="btn btn-sm btn-outline-dark"
                                                onClick={() => navigate(`/orders/${ord._id}`)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No orders yet</p>
            )}
        </div>
    );
}

function getStatusColor(status) {
    const colors = {
        pending: "warning",
        confirmed: "info",
        processing: "primary",
        shipped: "secondary",
        delivered: "success",
        cancelled: "danger",
    };
    return colors[status] || "secondary";
}

export default Orders;

import React, { useEffect, useState } from "react";
import { orderService } from "../../services/orderService";

function VendorOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVendorOrders = React.useCallback(async () => {
        try {
            const res = await orderService.getVendorOrders();
            setOrders(res.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVendorOrders();
    }, [fetchVendorOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            alert("Order status updated!");
            fetchVendorOrders();
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Error updating order status");
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
            <h1 className="mb-4">Orders</h1>

            {orders.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order.orderNumber}</td>
                                    <td>{order.user.name}</td>
                                    <td>{order.orderItems.length}</td>
                                    <td>₹{order.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
    };
    return colors[status] || "secondary";
}

export default VendorOrders;

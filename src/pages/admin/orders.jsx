import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/adminService";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getAllOrders(page, 10, statusFilter);
            setOrders(res.data.orders || []);
            setTotalPages(res.data.pages || 1);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            alert("Order status updated successfully!");
            fetchOrders();
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update status.");
        } finally {
            setUpdating(null);
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "pending": return "warning";
            case "confirmed": return "info";
            case "processing": return "primary";
            case "shipped": return "secondary";
            case "delivered": return "success";
            case "cancelled": return "danger";
            default: return "dark";
        }
    };

    if (loading && page === 1)
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    return (
        <div className="container-fluid py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Customer Orders</h1>
                <div className="d-flex gap-2">
                    <select
                        className="form-select w-auto"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id}>
                                    <td>
                                        <span className="fw-bold">{order.orderNumber}</span>
                                        <div className="small text-muted">{order.orderItems.length} items</div>
                                    </td>
                                    <td>
                                        <div>{order.user?.name}</div>
                                        <small className="text-muted">{order.user?.email}</small>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>₹{order.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge bg-${getStatusBadgeColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <select
                                                className="form-select form-select-sm"
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                disabled={updating === order._id || ["delivered", "cancelled"].includes(order.orderStatus)}
                                                style={{ width: "130px" }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirm</option>
                                                <option value="processing">Process</option>
                                                <option value="shipped">Ship</option>
                                                <option value="delivered">Deliver</option>
                                                <option value="cancelled">Cancel</option>
                                            </select>
                                            {updating === order._id && (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

export default AdminOrders;

import React, { useEffect, useState } from "react";
import { getAllUsers, approveVendor } from "../../services/adminService";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers(page, 10);
            setUsers(res.data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveVendor = async (userId) => {
        try {
            await approveVendor(userId, { isApproved: true });
            alert("Vendor approved!");
            fetchUsers();
        } catch (error) {
            console.error("Error approving vendor:", error);
            alert("Error approving vendor");
        }
    };

    const handleRejectVendor = async (userId) => {
        const reason = window.prompt("Enter rejection reason:");
        if (reason) {
            try {
                await approveVendor(userId, {
                    isApproved: false,
                    rejectionReason: reason,
                });
                alert("Vendor rejected!");
                fetchUsers();
            } catch (error) {
                console.error("Error rejecting vendor:", error);
                alert("Error rejecting vendor");
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
            <h1 className="mb-4">Users Management</h1>

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || "-"}</td>
                                <td>
                                    <span className={`badge bg-${getRoleBadgeColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.isActive ? (
                                        <span className="badge bg-success">Active</span>
                                    ) : (
                                        <span className="badge bg-danger">Inactive</span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {user.role === "vendor" && !user.isApproved ? (
                                        <div className="btn-group btn-group-sm">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleApproveVendor(user._id)}
                                                title="Approve Vendor"
                                            >
                                                <i className="bi bi-check-circle"></i> Approve
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleRejectVendor(user._id)}
                                                title="Reject Vendor"
                                            >
                                                <i className="bi bi-x-circle"></i> Reject
                                            </button>
                                        </div>
                                    ) : user.role === "vendor" && user.isApproved ? (
                                        <span className="badge bg-success">
                                            <i className="bi bi-check-circle"></i> Approved
                                        </span>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <nav aria-label="Page navigation">
                <ul className="pagination">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)}>
                            Previous
                        </button>
                    </li>
                    <li className="page-item active">
                        <span className="page-link">{page}</span>
                    </li>
                    <li className="page-item">
                        <button className="page-link" onClick={() => setPage(page + 1)}>
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

function getRoleBadgeColor(role) {
    const colors = {
        user: "primary",
        vendor: "success",
        admin: "danger",
    };
    return colors[role] || "secondary";
}

export default AdminUsers;

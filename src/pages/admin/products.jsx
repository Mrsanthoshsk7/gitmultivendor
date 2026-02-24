import React, { useEffect, useState } from "react";
import { getPendingProducts, approveProduct, getAllProducts } from "../../services/adminService";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("pending");

    useEffect(() => {
        if (filter === "pending") {
            fetchPendingProducts();
        } else {
            fetchAllProducts();
        }
    }, [filter]);

    const fetchPendingProducts = async () => {
        try {
            const res = await getPendingProducts();
            setProducts(res.data.products || []);
        } catch (error) {
            console.error("Error fetching pending products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const res = await getAllProducts();
            setProducts(res.data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (productId) => {
        try {
            await approveProduct(productId, { isApproved: true });
            alert("Product approved!");
            fetchPendingProducts();
        } catch (error) {
            console.error("Error approving product:", error);
        }
    };

    const handleReject = async (productId) => {
        try {
            await approveProduct(productId, { isApproved: false });
            alert("Product rejected!");
            fetchPendingProducts();
        } catch (error) {
            console.error("Error rejecting product:", error);
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
            <h1 className="mb-4">Product Approvals</h1>

            <div className="mb-4">
                <button
                    className={`btn btn-${filter === "pending" ? "primary" : "outline-primary"}`}
                    onClick={() => setFilter("pending")}
                >
                    Pending ({products.filter((p) => !p.isApproved).length})
                </button>
                <button
                    className={`btn btn-${filter === "all" ? "primary" : "outline-primary"} ms-2`}
                    onClick={() => setFilter("all")}
                >
                    All Products
                </button>
            </div>

            <div className="row">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product._id} className="col-md-4 mb-4">
                            <div className="card">
                                <img
                                    src={product.images?.[0]}
                                    className="card-img-top"
                                    alt={product.name}
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text small text-muted">{product.vendor?.storeName || "Unknown Vendor"}</p>
                                    <p className="card-text">
                                        <strong>₹{product.price}</strong>
                                    </p>
                                    <p className="card-text small">Stock: {product.stock}</p>

                                    <div className="mb-2">
                                        {product.isApproved ? (
                                            <span className="badge bg-success">Approved</span>
                                        ) : (
                                            <span className="badge bg-warning">Pending</span>
                                        )}
                                    </div>

                                    {!product.isApproved && (
                                        <div className="btn-group w-100">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleApprove(product._id)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleReject(product._id)}
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
                        <p>No products</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminProducts;

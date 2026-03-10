import React, { useEffect, useState } from "react";
import { productService } from "../../services/productService";

function VendorProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        images: [],
    });

    useEffect(() => {
        fetchVendorProducts();
    }, []);

    const fetchVendorProducts = async () => {
        try {
            const res = await productService.getMyVendorProducts();
            setProducts(res.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "images") {
            setFormData({
                ...formData,
                images: files,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("price", parseFloat(formData.price));
            formDataToSend.append("stock", parseInt(formData.stock));
            formDataToSend.append("category", formData.category);

            // Append images
            for (let i = 0; i < formData.images.length; i++) {
                formDataToSend.append("images", formData.images[i]);
            }

            await productService.createProduct(formDataToSend);
            alert("Product created!");
            setFormData({ name: "", description: "", price: "", stock: "", category: "", images: [] });
            setShowForm(false);
            fetchVendorProducts();
        } catch (error) {
            console.error("Error creating product:", error);
            alert("Error creating product");
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm("Delete this product?")) {
            try {
                await productService.deleteProduct(productId);
                alert("Product deleted!");
                fetchVendorProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>My Products</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Cancel" : "+ Add Product"}
                </button>
            </div>

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5>Create New Product</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Product Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter product name"
                                        className="form-control border-dark"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Price</label>
                                    <input
                                        type="number"
                                        className="form-control border-dark"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Stock</label>
                                    <input
                                        type="number"
                                        className="form-control border-dark"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Category</label>
                                    <input
                                        type="text"
                                        className="form-control border-dark"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control border-dark"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        required
                                    ></textarea>
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Images</label>
                                    <input
                                        type="file"
                                        className="form-control border-dark"
                                        name="images"
                                        onChange={handleChange}
                                        multiple
                                        accept="image/*"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-success">
                                Create Product
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="row">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product._id} className="col-md-6 mb-4">
                            <div className="card">
                                <img
                                    src={product.images?.[0]}
                                    className="card-img-top"
                                    alt={product.name}
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text">₹{product.price}</p>
                                    <p className="card-text small">
                                        Stock: {product.stock} | Rating: ⭐ {product.rating}
                                    </p>
                                    <p className="card-text small">
                                        {product.isApproved ? (
                                            <span className="badge bg-success">Approved</span>
                                        ) : (
                                            <span className="badge bg-warning">Pending Approval</span>
                                        )}
                                    </p>
                                    <div className="btn-group w-100">
                                        <button className="btn btn-sm btn-info">Edit</button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center">
                        <p>No products yet. Create one to get started!</p>
                    </div>
                )}
            </div>
        </div>








    );
}

export default VendorProducts;

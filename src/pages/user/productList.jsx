import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { cartService } from "../../services/cartService";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState("");
    const { toggleFavorite, isFavorite } = useFavorites();
    const { user } = useAuth();

    const handleAddToCart = async (productId) => {
        if (!user) {
            alert("Please login to add items to cart");
            return;
        }

        try {
            await cartService.addToCart(productId, 1);
            alert("Added to cart!");
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Failed to add to cart. Please try again.");
        }
    };

    const search = searchParams.get("search");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const params = {
                    page: currentPage,
                    limit: 12,
                };
                if (search) params.search = search;

                const productsRes = await productService.getAllProducts(params);
                setProducts(productsRes.products || []);

                // For categories, still use axios since productService might not have it
                const categoriesRes = await productService.getCategories();
                setCategories(categoriesRes.categories || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [search, currentPage]);

    return (
        <div className="container py-5 bg-light">
            <h1 className="mb-4">All Products</h1>

            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <>
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <h5>Categories</h5>
                            <div className="list-group">
                                <Link className="list-group-item list-group-item-action" to="/products">
                                    All Categories
                                    {/* Category */}
                                    <div className="col-md-2">
                                        <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} >
                                            <option value="">All Categories</option>
                                            <option value="Mobiles">Mobiles</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Home Appliance">Home Appliance</option>
                                        </select>
                                    </div>
                                </Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat._id}
                                        className="list-group-item list-group-item-action"
                                        to={`/products?category=${cat._id}`}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="col-md-9">
                            <div className="row">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <div key={product._id} className="col-md-4 mb-4">
                                            <div className="card h-100 position-relative product-card">
                                                {/* Hover Overlay */}
                                                <div className="card-overlay">
                                                    <button
                                                        className="btn btn-light me-2"
                                                        onClick={() => handleAddToCart(product._id)}
                                                        title="Add to Cart"
                                                    >
                                                        <i className="bi bi-cart-plus"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-light"
                                                        onClick={() => toggleFavorite(product)}
                                                        title={isFavorite(product._id) ? "Remove from Favorites" : "Add to Favorites"}
                                                    >
                                                        <i className={`bi ${isFavorite(product._id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                                                    </button>
                                                </div>

                                                <img
                                                    src={product.images?.[0] || "https://via.placeholder.com/200x200"}
                                                    className="card-img-top"
                                                    alt={product.name}
                                                    style={{ height: "250px", objectFit: "cover" }}
                                                />
                                                <div className="card-body">
                                                    <h5 className="card-title">{product.name}</h5>
                                                    <p className="card-text text-muted small">
                                                        {product.vendor?.storeName || "Unknown Vendor"}
                                                    </p>
                                                    <div className="mb-2">
                                                        <strong>₹{product.price}</strong>
                                                        {product.discount > 0 && (
                                                            <span className="badge bg-danger ms-2">{product.discount}% OFF</span>
                                                        )}
                                                    </div>
                                                    <div className="mb-2">⭐ {product.rating.toFixed(1)}</div>
                                                    <Link
                                                        to={`/products/${product._id}`}
                                                        className="btn btn-outline-dark btn-sm w-100"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center">
                                        <p>No products found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProductList;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { cartService } from "../../services/cartService";
import { reviewService } from "../../services/reviewService";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";

function ProductDetail() {
    const { productId: id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const [productRes, reviewsRes] = await Promise.all([
                    productService.getProduct(id),
                    reviewService.getProductReviews(id),
                ]);
                setProduct(productRes.product);
                setReviews(reviewsRes.reviews || []);
            } catch (error) {
                console.error("Error fetching product:", error);
                setError(error.response?.data?.message || "Failed to fetch product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            await cartService.addToCart(id, quantity);
            alert("Added to cart!");
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    if (loading)
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    if (!product)
        return (
            <div className="container py-5">
                <p>Product not found</p>
            </div>
        );

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-md-6">
                    <img
                        src={product.images?.[0] || "https://via.placeholder.com/400"}
                        className="img-fluid"
                        alt={product.name}
                    />
                </div>
                <div className="col-md-6">
                    <h1>{product.name}</h1>
                    <p className="text-muted">by {product.vendor?.storeName || "Unknown Vendor"}</p>

                    <div className="mb-3">
                        <h3>₹{product.price}</h3>
                        {product.discount > 0 && (
                            <span className="badge bg-danger">{product.discount}% OFF</span>
                        )}
                    </div>

                    <div className="mb-3">
                        <strong>Stock:</strong> {product.stock} units |
                        <strong> Rating:</strong> ⭐ {product.rating.toFixed(1)} ({product.numReviews} reviews)
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Quantity:</label>
                        <div className="input-group w-25">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </button>
                            <input type="text" className="form-control text-center" value={quantity} readOnly />
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="d-flex gap-2 mb-3">
                        <button
                            className="btn btn-outline-danger flex-fill"
                            onClick={() => toggleFavorite(product)}
                        >
                            <i className={`bi ${isFavorite(product._id) ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                            {isFavorite(product._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                        <button
                            className="btn btn-primary btn-lg flex-fill"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                    </div>

                    <div className="card mt-4">
                        <div className="card-body">
                            <h5 className="card-title">Description</h5>
                            <p>{product.description}</p>
                            {product.specifications && (
                                <>
                                    <h6>Specifications</h6>
                                    <ul>
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            <li key={key}>
                                                {key}: {value}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-12">
                    <h3>Reviews ({reviews.length})</h3>
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review._id} className="card mb-3">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h5 className="card-title">{review.title}</h5>
                                            <p className="mb-1">⭐ {review.rating} - {review.user.name}</p>
                                        </div>
                                        {review.verified && <span className="badge bg-success">Verified</span>}
                                    </div>
                                    <p className="card-text">{review.comment}</p>
                                    <small className="text-muted">
                                        👍 {review.helpful} 👎 {review.unhelpful}
                                    </small>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

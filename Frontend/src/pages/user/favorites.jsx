import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext";
import { cartService } from "../../services/cartService";
import { useAuth } from "../../context/AuthContext";

function Favorites() {
    const { favorites, toggleFavorite } = useFavorites();
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

    if (favorites.length === 0) {
        return (
            <div className="container py-5 text-center">
                <div className="mb-4">
                    <i className="bi bi-heart text-muted" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="mb-3">No Favorites Yet</h2>
                <p className="text-muted mb-4">
                    Start adding products to your favorites by clicking the heart icon on products you like!
                </p>
                <Link to="/products" className="btn btn-primary">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <i className="bi bi-heart-fill text-danger me-2"></i>
                    My Favorites ({favorites.length})
                </h2>
            </div>

            <div className="row">
                {favorites.map((product) => (
                    <div key={product._id} className="col-md-3 mb-4">
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
                                    title="Remove from Favorites"
                                >
                                    <i className="bi bi-heart-fill text-danger"></i>
                                </button>
                            </div>

                            <img
                                src={product.images?.[0] || "https://via.placeholder.com/300"}
                                className="card-img-top"
                                alt={product.name}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{product.name}</h5>
                                <p className="text-muted small">
                                    {product.category?.name || product.category}
                                </p>
                                <h6 className="text-primary mb-3">₹{product.price}</h6>
                                <div className="mt-auto">
                                    <Link
                                        to={`/products/${product._id}`}
                                        className="btn btn-primary btn-sm w-100"
                                    >
                                        View Product
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Favorites;
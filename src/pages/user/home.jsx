import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { cartService } from "../../services/cartService";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import banner1 from "../../assets/images/banner1.jpg";
import banner2 from "../../assets/images/banner2.jpg";
import banner3 from "../../assets/images/banner3.jpg";
import "./home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [minprice, setMinPrice] = useState("");
    const [maxprice, setMaxPrice] = useState("");
    const [loading, setLoading] = useState(false);
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

    const fetchCategories = React.useCallback(async () => {
        try {
            await productService.getCategories();
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    const fetchProductbyquery = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            if (minprice) params.minPrice = parseFloat(minprice);
            if (maxprice) params.maxPrice = parseFloat(maxprice);

            const response = await productService.getAllProducts(params);
            setProducts(response.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [category, minprice, maxprice]);

    useEffect(() => {
        fetchProductbyquery();
    }, [fetchProductbyquery]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);



    return (
        <><div className="home-container bg-dark text-light">
            {/* Carousel */}
            <div
                id="carouselExample"
                className="carousel slide shadow-sm mb-5"
                data-bs-ride="carousel"
            >
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="0" className="active"></button>
                    <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="1"></button>
                    <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="2"></button>
                </div>

                <div className="carousel-inner rounded-bottom">
                    <div className="carousel-item active">
                        <img src={banner1} className="d-block w-100 carousel-img" alt="Sale" />
                        <div className="carousel-caption text-start">
                            <h2>Super Sale Is Live</h2>
                            <p>Up to 50% off on electronics</p>
                            <Link to="/products" className="btn btn-light">
                                Shop Now
                            </Link>
                        </div>
                    </div>

                    <div className="carousel-item">
                        <img src={banner2} className="d-block w-100 carousel-img" alt="Fashion" />
                        <div className="carousel-caption text-start">
                            <h2>New Arrivals</h2>
                            <p>Latest fashion trends</p>
                            <Link to="/products" className="btn btn-light">
                                Explore More
                            </Link>
                        </div>
                    </div>

                    <div className="carousel-item">
                        <img src={banner3} className="d-block w-100 carousel-img" alt="Black Friday" />
                    </div>
                </div>

                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon"></span>
                </button>

                <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                    <span className="carousel-control-next-icon"></span>
                </button>
            </div>

            {/* Products Section */}
            <div className="container pb-5">
                <h2 className="fw-bold mb-4">Featured Collection</h2>

                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="card p-3">
                            <div className="row g-3">

                                {/* Category */}
                                <div className="col-md-2">
                                    <label className="form-label">Category</label>
                                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} >
                                        <option value="">All Categories</option>
                                        <option value="Mobiles">Mobiles</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Home Appliance">Home Appliance</option>
                                    </select>
                                </div>

                                {/* Min Price */}
                                <div className="col-md-2">
                                    <label className="form-label">Min Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={minprice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </div>

                                {/* Max Price */}
                                <div className="col-md-2">
                                    <label className="form-label">Max Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={maxprice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border"></div>
                    </div>
                ) : (
                    <div className="row">
                        {products.map((item) => (
                            <div key={item._id} className="col-md-3 mb-4">
                                <div className="card h-100 position-relative product-card">
                                    {/* Hover Overlay */}
                                    <div className="card-overlay">
                                        <button
                                            className="btn btn-light me-2"
                                            onClick={() => handleAddToCart(item._id)}
                                            title="Add to Cart"
                                        >
                                            <i className="bi bi-cart-plus"></i>
                                        </button>
                                        <button
                                            className="btn btn-light"
                                            onClick={() => toggleFavorite(item)}
                                            title={isFavorite(item._id) ? "Remove from Favorites" : "Add to Favorites"}
                                        >
                                            <i className={`bi ${isFavorite(item._id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                                        </button>
                                    </div>

                                    <img
                                        src={item.images?.[0] || "https://via.placeholder.com/300"}
                                        className="card-img-top"
                                        alt={item.name}
                                        style={{ height: "250px", objectFit: "cover" }}
                                    />
                                    <div className="card-body">
                                        <h5>{item.name}</h5>
                                        <p className="text-muted">
                                            {item.category?.name || item.category}
                                        </p>
                                        <h6 className="text-primary">₹{item.price}</h6>
                                        <p className="text-muted">{item.description}</p>
                                        <Link
                                            to={`/products/${item._id}`}
                                            className="btn btn-outline-dark btn-sm"
                                        >
                                            View Product
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

export default Home;
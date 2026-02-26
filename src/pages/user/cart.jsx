import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { cartService } from "../../services/cartService";
import { useAuth } from "../../context/AuthContext";

function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    useAuth();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await cartService.getCart();
            setCart(res.cart);
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        try {
            await cartService.updateCartItem(itemId, newQuantity);
            fetchCart();
        } catch (error) {
            console.error("Error updating cart:", error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await cartService.removeFromCart(itemId);
            fetchCart();
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm("Clear entire cart?")) {
            try {
                await cartService.clearCart();
                fetchCart();
            } catch (error) {
                console.error("Error clearing cart:", error);
            }
        }
    };

    if (loading)
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    if (!cart || cart.items.length === 0)
        return (
            <div className="container py-5 text-center">
                <h3>Your cart is empty</h3>
                <RouterLink to="/products" className="btn btn-primary mt-3">
                    Continue Shopping
                </RouterLink>
            </div>
        );

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    return (
        <div className="container py-5">
            <h1 className="mb-4">Shopping Cart</h1>

            <div className="row">
                <div className="col-lg-8">
                    {cart.items.map((item) => (
                        <div key={item._id} className="card mb-3">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-2">
                                        <img
                                            src={item.product.images?.[0]}
                                            className="img-fluid"
                                            alt={item.product.name}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <h5>{item.product.name}</h5>
                                        <p className="text-muted small">{item.vendor?.storeName || "Unknown Vendor"}</p>
                                    </div>
                                    <div className="col-md-2">
                                        <p className="mb-0">₹{item.price}</p>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="input-group">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm text-center"
                                                value={item.quantity}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-2 text-end">
                                        <p className="mb-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        <button
                                            className="btn btn-sm btn-danger mt-2"
                                            onClick={() => handleRemoveItem(item._id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Order Summary</h5>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <strong>₹{subtotal.toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tax (18%):</span>
                                <strong>₹{tax.toFixed(2)}</strong>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <h6>Total:</h6>
                                <h6>₹{total.toFixed(2)}</h6>
                            </div>
                            <RouterLink to="/checkout" className="btn btn-primary w-100 mb-2">
                                Proceed to Checkout
                            </RouterLink>
                            <button
                                className="btn btn-outline-danger w-100"
                                onClick={handleClearCart}
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;

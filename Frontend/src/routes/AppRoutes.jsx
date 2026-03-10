import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Components
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";

// User Components
import Home from "../pages/user/home";
import ProductList from "../pages/user/productList";
import ProductDetail from "../pages/user/productDetail";
import Cart from "../pages/user/cart";
import Checkout from "../pages/user/checkout";
import Payment from "../pages/user/payment";
import OrderConfirmed from "../pages/user/orderConfirmed";
import UserOrders from "../pages/user/orders";
import UserProfile from "../pages/user/userProfile";
import Favorites from "../pages/user/favorites";

// Vendor Components
import BecomeVendor from "../pages/vendor/becomeVendor";
import VendorDashboard from "../pages/vendor/dashboard";
import VendorProducts from "../pages/vendor/products";
import VendorOrders from "../pages/vendor/orders";
import VendorProfile from "../pages/vendor/profile";
import VendorAnalytics from "../pages/vendor/analytics";

// Admin Components
import AdminDashboard from "../pages/admin/dashboard";
import AdminUsers from "../pages/admin/users";
import AdminVendors from "../pages/admin/vendors";
import AdminProducts from "../pages/admin/products";
import AdminCategories from "../pages/admin/categories";
import AdminAnalytics from "../pages/admin/analytics";
import AdminOrders from "../pages/admin/orders";

// Common Components
import PrivateRoute from "../components/common/PrivateRoute";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";

// Layout component that includes navbar for authenticated users
const AppLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

// Role-based redirect component
const RoleBasedRedirect = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin/dashboard" />;
        case 'vendor':
            return <Navigate to="/vendor/dashboard" />;
        case 'user':
            return <Navigate to="/home" />;
        default:
            return <Navigate to="/" />;
    }
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route path="/home" element={
                <AppLayout>
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/products" element={
                <AppLayout>
                    <PrivateRoute>
                        <ProductList />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/products/:productId" element={
                <AppLayout>
                    <PrivateRoute>
                        <ProductDetail />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/cart" element={
                <AppLayout>
                    <PrivateRoute>
                        <Cart />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/checkout" element={
                <AppLayout>
                    <PrivateRoute>
                        <Checkout />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/payment" element={
                <AppLayout>
                    <PrivateRoute>
                        <Payment />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/order-confirmed" element={
                <AppLayout>
                    <PrivateRoute>
                        <OrderConfirmed />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/orders" element={
                <AppLayout>
                    <PrivateRoute>
                        <UserOrders />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/orders/:orderId" element={
                <AppLayout>
                    <PrivateRoute>
                        <UserOrders />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/profile" element={
                <AppLayout>
                    <PrivateRoute>
                        <UserProfile />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/favorites" element={
                <AppLayout>
                    <PrivateRoute>
                        <Favorites />
                    </PrivateRoute>
                </AppLayout>
            } />

            {/* Vendor Routes */}
            <Route path="/become-vendor" element={
                <AppLayout>
                    <PrivateRoute>
                        <BecomeVendor />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/vendor/dashboard" element={
                <AppLayout>
                    <PrivateRoute requiredRole="vendor">
                        <VendorDashboard />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/vendor/products" element={
                <AppLayout>
                    <PrivateRoute requiredRole="vendor">
                        <VendorProducts />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/vendor/orders" element={
                <AppLayout>
                    <PrivateRoute requiredRole="vendor">
                        <VendorOrders />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/vendor/profile" element={
                <AppLayout>
                    <PrivateRoute requiredRole="vendor">
                        <VendorProfile />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/vendor/analytics" element={
                <AppLayout>
                    <PrivateRoute requiredRole="vendor">
                        <VendorAnalytics />
                    </PrivateRoute>
                </AppLayout>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
                <AppLayout>
                    <PrivateRoute requiredRole="admin">
                        <AdminDashboard />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/admin/users" element={
                <AppLayout>
                    <PrivateRoute requiredRole="admin">
                        <AdminUsers />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/admin/vendors" element={
                <AppLayout>
                    <PrivateRoute requiredRole="admin">
                        <AdminVendors />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/admin/products" element={
                <AppLayout>
                    <PrivateRoute requiredRole="admin">
                        <AdminProducts />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/admin/categories" element={
                <AppLayout>
                    <PrivateRoute requiredRole="admin">
                        <AdminCategories />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/admin/analytics" element={
                <AppLayout>
                    <PrivateRoute requiredRole="admin">
                        <AdminAnalytics />
                    </PrivateRoute>
                </AppLayout>
            } />
            <Route path="/admin/orders" element={
                <AppLayout>
                    <PrivateRoute requiredRole="admin">
                        <AdminOrders />
                    </PrivateRoute>
                </AppLayout>
            } />

            {/* Catch all route - redirect to role-based home */}
            <Route path="*" element={<AppLayout><RoleBasedRedirect /></AppLayout>} />
        </Routes>
    );
}

export default AppRoutes;

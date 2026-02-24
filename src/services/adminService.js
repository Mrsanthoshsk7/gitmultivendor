import axios from "axios";
import api from "./api";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const ADMIN_BASE_URL = `${API_URL}/admin`;

// Create axios instance for admin
const adminAPI = axios.create({
    baseURL: ADMIN_BASE_URL,
});

// Attach token automatically
adminAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//
// ADMIN APIs
//

// Analytics
export const getAnalytics = async () => adminAPI.get("/analytics");
export const getRevenueAnalytics = async () => adminAPI.get("/analytics/revenue");

// Users
export const getAllUsers = async (page = 1, limit = 10) =>
    adminAPI.get(`/users?page=${page}&limit=${limit}`);

// Categories
export const getCategories = async () => adminAPI.get("/categories");
export const createCategory = async (data) => adminAPI.post("/categories", data);
export const updateCategory = async (id, data) => adminAPI.put(`/categories/${id}`, data);
export const deleteCategory = async (id) => adminAPI.delete(`/categories/${id}`);

// Products
export const getAllProducts = async () => api.get("/products");
export const getPendingProducts = async () => adminAPI.get("/products/pending");
export const approveProduct = async (id, data = { isApproved: true }) =>
    adminAPI.put(`/products/${id}/approve`, data);

// Vendors
export const getVendors = async () => api.get("/vendors");
export const approveVendor = async (id, data = { isApproved: true }) =>
    adminAPI.put(`/vendors/${id}/approve`, data);

// Orders
export const getAllOrders = async (page = 1, limit = 10, status = "") =>
    adminAPI.get(`/orders?page=${page}&limit=${limit}&status=${status}`);

export const updateOrderStatus = async (orderId, status) => {
    // Admin uses the existing order controller which is protected with authorize("admin")
    return await api.put(`/orders/${orderId}/status`, { orderStatus: status });
};

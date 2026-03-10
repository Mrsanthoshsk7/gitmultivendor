import api from './api';

// Product Service
export const productService = {
    // Public routes
    getAllProducts: async (params = {}) => {
        try {
            const response = await api.get('/products', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getProduct: async (productId) => {
        try {
            const response = await api.get(`/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getVendorProducts: async (vendorId) => {
        try {
            const response = await api.get(`/products/vendor/${vendorId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getMyVendorProducts: async () => {
        try {
            const response = await api.get('/products/vendor/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Vendor routes (require authentication)
    createProduct: async (productData) => {
        try {
            const response = await api.post('/products', productData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateProduct: async (productId, productData) => {
        try {
            const response = await api.put(`/products/${productId}`, productData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteProduct: async (productId) => {
        try {
            const response = await api.delete(`/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getCategories: async () => {
        try {
            const response = await api.get('/products/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};
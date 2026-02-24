import api from './api';

// Order Service
export const orderService = {
    // User routes
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders/create', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getUserOrders: async () => {
        try {
            const response = await api.get('/orders');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getOrder: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    cancelOrder: async (orderId) => {
        try {
            const response = await api.post(`/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Vendor routes
    getVendorOrders: async () => {
        try {
            const response = await api.get('/orders/vendor/all');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin routes
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.put(`/orders/${orderId}/status`, { orderStatus: status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};
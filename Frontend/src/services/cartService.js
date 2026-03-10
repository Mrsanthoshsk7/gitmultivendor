import api from './api';

// Cart Service
export const cartService = {
    getCart: async () => {
        try {
            const response = await api.get('/cart');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    addToCart: async (productId, quantity = 1) => {
        try {
            const response = await api.post('/cart/add', { productId, quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateCartItem: async (itemId, quantity) => {
        try {
            const response = await api.put(`/cart/item/${itemId}`, { quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    removeFromCart: async (itemId) => {
        try {
            const response = await api.delete(`/cart/item/${itemId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    clearCart: async () => {
        try {
            const response = await api.delete('/cart/clear');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};
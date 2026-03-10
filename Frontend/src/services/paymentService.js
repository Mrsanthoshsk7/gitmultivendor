import api from './api';

// Payment Service
export const paymentService = {
    createOrder: async (orderId) => {
        try {
            const response = await api.post('/payments/create-order', { orderId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    verifyPayment: async (paymentData) => {
        try {
            const response = await api.post('/payments/verify', paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getPaymentStatus: async (paymentId) => {
        try {
            const response = await api.get(`/payments/status/${paymentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    refundPayment: async (refundData) => {
        try {
            const response = await api.post('/payments/refund', refundData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};
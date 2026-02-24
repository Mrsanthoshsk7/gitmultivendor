import api from './api';

// Review Service
export const reviewService = {
    createReview: async (reviewData) => {
        try {
            const response = await api.post('/reviews', reviewData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getProductReviews: async (productId) => {
        try {
            const response = await api.get(`/reviews/product/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getMyReviews: async () => {
        try {
            const response = await api.get('/reviews/user/my-reviews');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateReview: async (reviewId, reviewData) => {
        try {
            const response = await api.put(`/reviews/${reviewId}`, reviewData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteReview: async (reviewId) => {
        try {
            const response = await api.delete(`/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    markHelpful: async (reviewId) => {
        try {
            const response = await api.post(`/reviews/${reviewId}/helpful`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};
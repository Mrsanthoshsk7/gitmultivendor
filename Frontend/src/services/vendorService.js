import api from './api';

// Vendor Service
export const vendorService = {
    // Public routes
    getPublicVendorProfile: async (vendorId) => {
        try {
            const response = await api.get(`/vendors/${vendorId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch vendor details" };
        }
    },

    getVendorReviews: async (vendorId) => {
        try {
            const response = await api.get(`/vendors/${vendorId}/reviews`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch vendor reviews" };
        }
    },

    // Vendor routes (require authentication)
    registerVendor: async (vendorData) => {
        try {
            const response = await api.post('/vendors/register', vendorData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Vendor registration failed" };
        }
    },

    getVendorProfile: async () => {
        try {
            const response = await api.get('/vendors/profile/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch vendor profile" };
        }
    },

    updateVendorProfile: async (vendorData) => {
        try {
            const response = await api.put('/vendors/profile/me', vendorData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update vendor profile" };
        }
    },

    getVendorStats: async () => {
        try {
            const response = await api.get('/vendors/dashboard/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch vendor stats" };
        }
    },

    // Admin routes
    getAllVendors: async () => {
        try {
            const response = await api.get('/vendors');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch vendors" };
        }
    },
};

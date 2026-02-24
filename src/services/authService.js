import api from './api';

// Auth Service
export const authService = {
    // Public routes
    registerUser: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Registration failed" };
        }
    },

    loginUser: async (loginData) => {
        try {
            const response = await api.post('/auth/login', loginData);
            // Save token automatically
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Login failed" };
        }
    },

    // Protected routes
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch user" };
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Profile update failed" };
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await api.post('/auth/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Password change failed" };
        }
    },

    logoutUser: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            localStorage.removeItem("token");
        }
    },

    // Utility functions
    getToken: () => {
        return localStorage.getItem("token");
    },

    getAuthHeader: () => {
        const token = authService.getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    },
};

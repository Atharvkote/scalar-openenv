import axios from 'axios'

const API = import.meta.env.VITE_APP_URI_API

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API,
    withCredentials: true,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1]
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            document.cookie = "authToken=; path=/; max-age=0"
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export const userService = {
    // Get all sessions for the logged-in user
    getAllSessions: async () => {
        try {
            const response = await apiClient.get('/api/user/sessions')
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch sessions')
        }
    },

    // Get all orders for a specific session
    getSessionOrders: async (sessionId) => {
        try {
            const response = await apiClient.get(`/api/user/session/${sessionId}/orders`)
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch session orders')
        }
    },

    // Get the current active session for the user
    getActiveSession: async () => {
        try {
            const response = await apiClient.get('/api/user/active-session')
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch active session')
        }
    },

    // Get user profile
    getUserProfile: async () => {
        try {
            const response = await apiClient.get('/api/user/profile')
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user profile')
        }
    },

    // Update user profile
    updateUserProfile: async (profileData) => {
        try {
            const response = await apiClient.put('/api/user/profile', profileData)
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update user profile')
        }
    },

    // Get order history with pagination
    getOrderHistory: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/user/orders', { params })
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch order history')
        }
    },

    // Process session payment
    processSessionPayment: async (sessionId, paymentData) => {
        try {
            const response = await apiClient.post(`/api/payment/process-session/${sessionId}`, paymentData)
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Payment processing failed')
        }
    },

    // Generate bill for session
    generateBill: async (sessionId) => {
        try {
            const response = await apiClient.post('/api/payment/generate-bill', { sessionId })
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to generate bill')
        }
    },

    // Reorder items
    reorderItems: async (items, sessionId) => {
        try {
            const response = await apiClient.post('/api/order/reorder', { items, sessionId })
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to reorder items')
        }
    }
}

export default userService 
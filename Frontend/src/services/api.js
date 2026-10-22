import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL,
    withCredentials: true
});

// Intercept requests to attach Bearer token from localStorage for iOS Safari and cross-site resilience
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // Guard against Safari private browsing mode restrictions
            console.warn("Storage access restricted:", e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept responses to handle 401s (token expiry or invalidation)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            try {
                localStorage.removeItem("token");
            } catch {
                // ignore storage error in restricted contexts
            }
        }
        return Promise.reject(error);
    }
);

export default api;

import { createContext, useState, useEffect } from "react";
import { login, register, logout, getMe } from "./services/auth.api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                const data = await getMe();
                if (isMounted && data && data.user) {
                    setUser(data.user);
                } else if (isMounted) {
                    setUser(null);
                }
            } catch {
                if (isMounted) {
                    setUser(null);
                    try {
                        localStorage.removeItem("token");
                    } catch {
                        // ignore storage errors
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            if (data && data.token) {
                try {
                    localStorage.setItem("token", data.token);
                } catch (e) {
                    console.warn("Could not save token:", e);
                }
            }
            if (data && data.user) {
                setUser(data.user);
                return data.user;
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            if (data && data.token) {
                try {
                    localStorage.setItem("token", data.token);
                } catch (e) {
                    console.warn("Could not save token:", e);
                }
            }
            if (data && data.user) {
                setUser(data.user);
                return data.user;
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
        } catch (e) {
            console.error("Logout error:", e);
        } finally {
            try {
                localStorage.removeItem("token");
            } catch {
                // ignore
            }
            setUser(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading,
                handleLogin,
                handleRegister,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
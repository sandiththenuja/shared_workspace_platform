// context/AuthContext.jsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // If no token, set loading to false and return
            if (!token) {
                setLoading(false);
                setAuthUser(null);
                return;
            }
            
            // Set auth header
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            
            const { data } = await axios.get("/api/auth/check");
            
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            } else {
                // Token invalid - clear everything
                localStorage.removeItem("token");
                setToken(null);
                setAuthUser(null);
                delete axios.defaults.headers.common["Authorization"];
            }
        } catch (error) {
            console.log("Auth check failed:", error.message);
            // Clear invalid token
            localStorage.removeItem("token");
            setToken(null);
            setAuthUser(null);
            delete axios.defaults.headers.common["Authorization"];
        } finally {
            setLoading(false);
        }
    };

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                // Set auth user
                setAuthUser(data.userData);
                
                // Store token
                const token = data.token;
                setToken(token);
                localStorage.setItem("token", token);
                
                // Set axios header
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                
                // Connect socket
                connectSocket(data.userData);
                
                toast.success(data.message);
                return { success: true, data };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.log("Login error:", error);
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        delete axios.defaults.headers.common["Authorization"];
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        toast.success("Logged out successfully");
    };

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated");
                return { success: true, user: data.user };
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return { success: false, message: error.message };
        }
    };

    const connectSocket = (userData) => {
        if (!userData) return;
        if (socket?.connected) return;
        
        const newSocket = io(backendUrl, {
            query: { userId: userData._id },
            transports: ['websocket'],
            withCredentials: true
        });
        
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });
    };

    useEffect(() => {
        checkAuth();
    }, []); // Run only once on mount

    const value = {
        authUser,
        setAuthUser,
        onlineUsers,
        socket,
        token,
        loading,
        login,
        logout,
        updateProfile,
        checkAuth,
        isAuthenticated: !!authUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
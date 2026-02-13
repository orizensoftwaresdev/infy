// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Verify token on mount
    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    const userData = res.data.data.user;
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setInitializing(false);
        };
        verifyAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user: userData } = res.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true, data: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, phone) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, phone });
            const { token, user: userData } = res.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true, data: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user, loading, initializing, isAuthenticated, isAdmin,
            login, register, logout, updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

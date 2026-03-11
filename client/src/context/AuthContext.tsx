import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const res = await authService.getMe();
                if (res.success) {
                    setUser(res.data);
                }
            }
        } catch (err) {
            console.error('Error loading user:', err);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (credentials: any) => {
        const res = await authService.login(credentials);
        if (res.token) {
            localStorage.setItem('token', res.token);
            await loadUser();
        }
    };

    const register = async (userData: any) => {
        const res = await authService.register(userData);
        if (res.token) {
            localStorage.setItem('token', res.token);
            await loadUser();
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

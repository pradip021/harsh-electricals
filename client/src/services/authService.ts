import api from './api';
import { User, AuthResponse } from '../types';

export const login = async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const getMe = async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
};

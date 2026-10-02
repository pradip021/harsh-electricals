import api from './api';
import { Quotation } from '../types';

export const getQuotations = async () => {
    const response = await api.get('/quotations');
    return response.data;
};

export const getQuotation = async (id: string) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
};

export const createQuotation = async (quotationData: Partial<Quotation>) => {
    const response = await api.post('/quotations', quotationData);
    return response.data;
};

export const updateQuotation = async (id: string, quotationData: Partial<Quotation>) => {
    const response = await api.put(`/quotations/${id}`, quotationData);
    return response.data;
};

export const deleteQuotation = async (id: string) => {
    const response = await api.delete(`/quotations/${id}`);
    return response.data;
};

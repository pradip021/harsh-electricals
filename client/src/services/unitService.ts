import api from './api';

export const getUnits = async () => {
    const response = await api.get('/units');
    return response.data;
};

export const createUnit = async (name: string) => {
    const response = await api.post('/units', { name });
    return response.data;
};

export const updateUnit = async (id: string, name: string) => {
    const response = await api.put(`/units/${id}`, { name });
    return response.data;
};

export const deleteUnit = async (id: string) => {
    const response = await api.delete(`/units/${id}`);
    return response.data;
};

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Quotation } from '../types';
import * as quotationService from '../services/quotationService';

interface QuotationContextType {
    quotations: Quotation[];
    loading: boolean;
    error: string | null;
    fetchQuotations: () => Promise<void>;
    addQuotation: (quotation: Partial<Quotation>) => Promise<void>;
    updateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<void>;
    deleteQuotation: (id: string) => Promise<void>;
    getQuotationById: (id: string) => Quotation | undefined;
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export const useQuotations = () => {
    const context = useContext(QuotationContext);
    if (!context) {
        throw new Error('useQuotations must be used within QuotationProvider');
    }
    return context;
};

export const QuotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await quotationService.getQuotations();
            if (res.success) {
                setQuotations(res.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch quotations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    const addQuotation = async (quotation: Partial<Quotation>) => {
        try {
            const res = await quotationService.createQuotation(quotation);
            if (res.success) {
                setQuotations(prev => [res.data, ...prev]);
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to add quotation');
        }
    };

    const updateQuotation = async (id: string, updatedQuotation: Partial<Quotation>) => {
        try {
            const res = await quotationService.updateQuotation(id, updatedQuotation);
            if (res.success) {
                setQuotations(prev =>
                    prev.map(q => q._id === id || q.id === id ? res.data : q)
                );
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to update quotation');
        }
    };

    const deleteQuotation = async (id: string) => {
        try {
            const res = await quotationService.deleteQuotation(id);
            if (res.success) {
                setQuotations(prev => prev.filter(q => q._id !== id && q.id !== id));
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to delete quotation');
        }
    };

    const getQuotationById = (id: string) => {
        return quotations.find(q => q._id === id || q.id === id);
    };

    const value = useMemo(
        () => ({
            quotations,
            loading,
            error,
            fetchQuotations,
            addQuotation,
            updateQuotation,
            deleteQuotation,
            getQuotationById,
        }),
        [quotations, loading, error, fetchQuotations]
    );

    return (
        <QuotationContext.Provider value={value}>
            {children}
        </QuotationContext.Provider>
    );
};

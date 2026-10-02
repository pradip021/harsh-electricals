import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CustomUnit } from '../types';
import * as unitService from '../services/unitService';
import { useAuth } from './AuthContext';
import { MAX_UNIT_NAME_LENGTH, isReservedUnitName, normalizeUnitName, sortUnits, unitNameKey } from '../utils/units';

interface UnitsContextType {
    customUnits: CustomUnit[];
    loading: boolean;
    error: string | null;
    refreshUnits: () => Promise<void>;
    createUnit: (name: string) => Promise<CustomUnit>;
    updateUnit: (id: string, name: string) => Promise<CustomUnit>;
    deleteUnit: (id: string) => Promise<void>;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

/** Custom units used to live only in this browser; they are moved to the server once. */
const LEGACY_STORAGE_KEY = 'custom_units';

const apiError = (err: any, fallback: string) => new Error(err.response?.data?.error || fallback);

const importLegacyUnits = async (existing: CustomUnit[]): Promise<CustomUnit[]> => {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return existing;

    let names: unknown = [];
    try {
        names = JSON.parse(raw);
    } catch {
        names = [];
    }

    const keys = new Set(existing.map((u) => unitNameKey(u.name)));
    const result = [...existing];
    let failed = false;
    for (const value of Array.isArray(names) ? names : []) {
        const name = normalizeUnitName(String(value));
        if (!name || name.length > MAX_UNIT_NAME_LENGTH || isReservedUnitName(name) || keys.has(unitNameKey(name))) continue;
        try {
            const res = await unitService.createUnit(name);
            result.push(res.data);
            keys.add(unitNameKey(name));
        } catch (err: any) {
            const status = err.response?.status;
            if (status !== 400 && status !== 409) failed = true;
        }
    }
    if (!failed) localStorage.removeItem(LEGACY_STORAGE_KEY);
    return result;
};

export const useUnits = () => {
    const context = useContext(UnitsContext);
    if (!context) {
        throw new Error('useUnits must be used within UnitsProvider');
    }
    return context;
};

export const UnitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?._id || user?.id || null;
    const [customUnits, setCustomUnits] = useState<CustomUnit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshUnits = useCallback(async () => {
        setLoading(true);
        try {
            const res = await unitService.getUnits();
            if (res.success) setCustomUnits(sortUnits(res.data));
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load units');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!userId) {
            setCustomUnits([]);
            return;
        }
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await unitService.getUnits();
                const units = await importLegacyUnits(res.data || []);
                if (!cancelled) {
                    setCustomUnits(sortUnits(units));
                    setError(null);
                }
            } catch (err: any) {
                if (!cancelled) setError(err.response?.data?.error || 'Failed to load units');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    const createUnit = useCallback(async (name: string) => {
        try {
            const res = await unitService.createUnit(name);
            setCustomUnits((prev) => sortUnits([...prev, res.data]));
            return res.data as CustomUnit;
        } catch (err: any) {
            throw apiError(err, 'Failed to create unit');
        }
    }, []);

    const updateUnit = useCallback(async (id: string, name: string) => {
        try {
            const res = await unitService.updateUnit(id, name);
            setCustomUnits((prev) => sortUnits(prev.map((u) => (u._id === id ? res.data : u))));
            return res.data as CustomUnit;
        } catch (err: any) {
            throw apiError(err, 'Failed to update unit');
        }
    }, []);

    const deleteUnit = useCallback(async (id: string) => {
        try {
            await unitService.deleteUnit(id);
            setCustomUnits((prev) => prev.filter((u) => u._id !== id));
        } catch (err: any) {
            throw apiError(err, 'Failed to delete unit');
        }
    }, []);

    const value = useMemo(
        () => ({ customUnits, loading, error, refreshUnits, createUnit, updateUnit, deleteUnit }),
        [customUnits, loading, error, refreshUnits, createUnit, updateUnit, deleteUnit]
    );

    return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
};

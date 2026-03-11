import { useState } from 'react';

const DEFAULT_UNITS = ['Nos', 'Mtr', 'Pcs', 'RF', 'SqFt', 'LS', 'Text'];

export const useUnits = () => {
    const [units, setUnits] = useState<string[]>(() => {
        const saved = localStorage.getItem('custom_units');
        const custom = saved ? JSON.parse(saved) : [];
        return [...new Set([...DEFAULT_UNITS, ...custom])];
    });

    const addUnit = (newUnit: string) => {
        if (!newUnit) return;
        const normalized = newUnit.trim();
        if (units.includes(normalized)) return;

        const updated = [...units, normalized];
        setUnits(updated);

        const saved = localStorage.getItem('custom_units');
        const custom = saved ? JSON.parse(saved) : [];
        if (!custom.includes(normalized)) {
            custom.push(normalized);
            localStorage.setItem('custom_units', JSON.stringify(custom));
        }
    };

    const removeCustomUnit = (unitToRemove: string) => {
        if (DEFAULT_UNITS.includes(unitToRemove)) return;

        const updated = units.filter(u => u !== unitToRemove);
        setUnits(updated);

        const saved = localStorage.getItem('custom_units');
        const custom = saved ? JSON.parse(saved) : [];
        const updatedCustom = custom.filter((u: string) => u !== unitToRemove);
        localStorage.setItem('custom_units', JSON.stringify(updatedCustom));
    };

    return { units, addUnit, removeCustomUnit };
};

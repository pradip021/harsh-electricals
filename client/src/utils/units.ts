import { CustomUnit, Quotation, QuotationItem } from '../types';

// System units have fixed codes with behaviour attached ('Text'/'LS' switch quantity to text mode).
// Keep in sync with server/src/utils/units.ts.
export const SYSTEM_UNIT_GROUPS: { title: string; units: string[] }[] = [
    { title: 'Standard', units: ['Nos', 'Pcs', 'Mtr'] },
    { title: 'Format', units: ['RF', 'SqFt', 'LS', 'Text'] },
];

export const SYSTEM_UNITS = SYSTEM_UNIT_GROUPS.flatMap((group) => group.units);

export const SYSTEM_UNIT_LABELS: Record<string, string> = {
    Nos: 'Quantity (Nos)',
    Text: 'Descriptive Text',
    LS: 'Lump Sum (LS)',
};

export const MAX_UNIT_NAME_LENGTH = 30;

export interface UnitSelection {
    unit: string;
    unitId: string | null;
}

export const normalizeUnitName = (name: string) => name.replace(/\s+/g, ' ').trim();
export const unitNameKey = (name: string) => normalizeUnitName(name).toLowerCase();

const RESERVED_KEYS = new Set([...SYSTEM_UNITS, ...Object.values(SYSTEM_UNIT_LABELS)].map(unitNameKey));

export const isReservedUnitName = (name: string) => RESERVED_KEYS.has(unitNameKey(name));

export const sortUnits = (units: CustomUnit[]) =>
    [...units].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

/** Returns an error message, or null when the name can be used for a new/renamed custom unit. */
export const validateUnitName = (name: string, customUnits: CustomUnit[], editingId?: string): string | null => {
    const normalized = normalizeUnitName(name);
    if (!normalized) return 'Unit name is required';
    if (normalized.length > MAX_UNIT_NAME_LENGTH) return `Unit name must be at most ${MAX_UNIT_NAME_LENGTH} characters`;
    if (isReservedUnitName(normalized)) return `"${normalized}" is a built-in unit`;
    const key = unitNameKey(normalized);
    if (customUnits.some((u) => u._id !== editingId && unitNameKey(u.name) === key)) {
        return `A custom unit named "${normalized}" already exists`;
    }
    return null;
};

export const resolveUnitName = (item: Pick<QuotationItem, 'unit' | 'unitId'>, customUnits: CustomUnit[]) =>
    (item.unitId && customUnits.find((u) => u._id === item.unitId)?.name) || item.unit;

/** Uses the current custom-unit names, so renamed units display correctly in cached quotations. */
export const withResolvedUnitNames = (quotation: Quotation, customUnits: CustomUnit[]): Quotation => ({
    ...quotation,
    items: quotation.items.map((item) => (item.unitId ? { ...item, unit: resolveUnitName(item, customUnits) } : item)),
});

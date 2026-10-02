import Unit, { IUnit } from '../models/Unit';

// System units have fixed codes with behaviour attached (e.g. 'Text'/'LS' switch quantity to text mode).
// Keep in sync with client/src/utils/units.ts.
export const SYSTEM_UNITS = ['Nos', 'Mtr', 'Pcs', 'RF', 'SqFt', 'LS', 'Text'];
const SYSTEM_UNIT_LABELS = ['Quantity (Nos)', 'Lump Sum (LS)', 'Descriptive Text'];
export const MAX_UNIT_NAME_LENGTH = 30;

export const normalizeUnitName = (name: string) => String(name ?? '').replace(/\s+/g, ' ').trim();
export const unitNameKey = (name: string) => normalizeUnitName(name).toLowerCase();

const SYSTEM_KEYS = new Set(SYSTEM_UNITS.map(unitNameKey));
const RESERVED_KEYS = new Set([...SYSTEM_UNITS, ...SYSTEM_UNIT_LABELS].map(unitNameKey));

export const isSystemUnit = (name: string) => SYSTEM_KEYS.has(unitNameKey(name));
export const isReservedUnitName = (name: string) => RESERVED_KEYS.has(unitNameKey(name));

interface UnitAssignableItem {
    isSection: boolean;
    unit: string;
    unitId?: string | null;
}

/**
 * Makes every row's unit consistent with the owner's unit definitions:
 * - a known `unitId` wins and its current name is copied into `unit`;
 * - system units carry no `unitId`;
 * - any other name (legacy rows, templates, stale/foreign ids) is linked to the owner's
 *   unit with that name, creating the definition if needed, so references never dangle.
 */
export const resolveItemUnits = async (ownerId: string, items: UnitAssignableItem[]) => {
    const units = await Unit.find({ user: ownerId });
    const byId = new Map<string, IUnit>(units.map((u) => [String(u._id), u]));
    const byKey = new Map<string, IUnit>(units.map((u) => [u.nameKey, u]));

    for (const item of items) {
        if (item.isSection) {
            item.unitId = null;
            continue;
        }

        const linked = item.unitId ? byId.get(String(item.unitId)) : undefined;
        if (linked) {
            item.unitId = String(linked._id);
            item.unit = linked.name;
            continue;
        }

        const name = normalizeUnitName(item.unit);
        if (!name || isReservedUnitName(name) || name.length > MAX_UNIT_NAME_LENGTH) {
            item.unitId = null;
            continue;
        }

        const key = unitNameKey(name);
        let unit = byKey.get(key);
        if (!unit) {
            unit = await Unit.findOneAndUpdate(
                { user: ownerId, nameKey: key },
                { $setOnInsert: { name } },
                { upsert: true, returnDocument: 'after', runValidators: true }
            ) as IUnit;
            byKey.set(key, unit);
            byId.set(String(unit._id), unit);
        }
        item.unitId = String(unit._id);
        item.unit = unit.name;
    }
};

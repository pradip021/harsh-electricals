import ErrorResponse from './errorResponse';

export const COLUMN_TYPES = ['text', 'number'] as const;
export const VALUE_MODES = ['MANUAL', 'AUTO_INCREMENT'] as const;
export const SYSTEM_COLUMN_KEYS = ['description', 'qty', 'rate', 'amount'] as const;

export type ColumnType = typeof COLUMN_TYPES[number];
export type ColumnValueMode = typeof VALUE_MODES[number];
export type SystemColumnKey = typeof SYSTEM_COLUMN_KEYS[number];
export type CellValue = string | number | null;

export const MAX_COLUMNS = 20;
export const MAX_COLUMN_NAME_LENGTH = 40;
export const MAX_CELL_TEXT_LENGTH = 500;
export const COLUMN_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// New value modes only need an entry here (and in the client registry) to be accepted.
export const VALUE_MODE_SUPPORTED_TYPES: Record<ColumnValueMode, ColumnType[]> = {
    MANUAL: ['text', 'number'],
    AUTO_INCREMENT: ['number'],
};

const SYSTEM_COLUMN_SHAPE: Record<SystemColumnKey, { type: ColumnType; editable: boolean }> = {
    description: { type: 'text', editable: true },
    qty: { type: 'number', editable: true },
    rate: { type: 'number', editable: true },
    amount: { type: 'number', editable: false },
};

export interface AutoIncrementConfig {
    start: number;
    step: number;
    resetOnColumnId?: string | null;
}

export interface TableColumn {
    id: string;
    name: string;
    type: ColumnType;
    position: number;
    width?: number | null;
    valueMode: ColumnValueMode;
    autoIncrement?: AutoIncrementConfig | null;
    defaultValue?: CellValue;
    editable: boolean;
    systemKey?: SystemColumnKey | null;
}

export interface TableItemInput {
    pointName: string;
    description?: string;
    qty?: string | number | null;
    unit?: string;
    unitId?: string | null;
    rate?: number;
    amount?: number;
    isSection?: boolean;
    values?: Record<string, CellValue>;
}

export interface TableItem {
    pointName: string;
    description: string;
    qty: string | number;
    unit: string;
    unitId: string | null;
    rate: number;
    amount: number;
    isSection: boolean;
    values: Record<string, CellValue>;
}

const badRequest = (message: string) => new ErrorResponse(message, 400);

/** Columns that map the original fixed table (used for new and pre-existing quotations). */
export const createDefaultColumns = (): TableColumn[] => [
    { id: 'sr', name: 'Sr. No.', type: 'number', position: 0, width: 64, valueMode: 'AUTO_INCREMENT', autoIncrement: { start: 1, step: 1, resetOnColumnId: null }, defaultValue: null, editable: false, systemKey: null },
    { id: 'description', name: 'Description', type: 'text', position: 1, width: null, valueMode: 'MANUAL', autoIncrement: null, defaultValue: null, editable: true, systemKey: 'description' },
    { id: 'qty', name: 'Qty.', type: 'number', position: 2, width: 170, valueMode: 'MANUAL', autoIncrement: null, defaultValue: null, editable: true, systemKey: 'qty' },
    { id: 'rate', name: 'Rate', type: 'number', position: 3, width: 160, valueMode: 'MANUAL', autoIncrement: null, defaultValue: null, editable: true, systemKey: 'rate' },
    { id: 'amount', name: 'Amount', type: 'number', position: 4, width: 144, valueMode: 'MANUAL', autoIncrement: null, defaultValue: null, editable: false, systemKey: 'amount' },
];

export const coerceCellValue = (value: unknown, type: ColumnType, label: string): CellValue => {
    if (value === undefined || value === null || value === '') return null;
    if (type === 'number') {
        const num = typeof value === 'number' ? value : Number(String(value).trim());
        if (!Number.isFinite(num)) throw badRequest(`${label} must be a number`);
        return num;
    }
    const text = String(value);
    if (text.length > MAX_CELL_TEXT_LENGTH) {
        throw badRequest(`${label} must be at most ${MAX_CELL_TEXT_LENGTH} characters`);
    }
    return text;
};

export const normalizeColumns = (input?: Partial<TableColumn>[] | null): TableColumn[] => {
    if (!input || input.length === 0) return createDefaultColumns();
    if (input.length > MAX_COLUMNS) throw badRequest(`A quotation can have at most ${MAX_COLUMNS} columns`);

    const ids = new Set<string>();
    const names = new Set<string>();
    const systemSeen = new Set<SystemColumnKey>();

    const ordered = input
        .map((column, index) => ({ column, index }))
        .sort((a, b) => ((a.column.position ?? a.index) - (b.column.position ?? b.index)) || a.index - b.index);

    const columns: TableColumn[] = ordered.map(({ column }, position) => {
        const id = String(column.id || '');
        const name = String(column.name || '').trim();
        if (!COLUMN_ID_PATTERN.test(id)) throw badRequest(`Invalid column id "${id}"`);
        if (!name) throw badRequest('Every column needs a name');
        if (name.length > MAX_COLUMN_NAME_LENGTH) throw badRequest(`Column name "${name}" is too long`);
        if (ids.has(id)) throw badRequest(`Duplicate column id "${id}"`);
        if (names.has(name.toLowerCase())) throw badRequest(`Duplicate column name "${name}"`);
        ids.add(id);
        names.add(name.toLowerCase());

        const width = column.width ?? null;

        if (column.systemKey) {
            const key = column.systemKey;
            if (!SYSTEM_COLUMN_KEYS.includes(key)) throw badRequest(`Unknown built-in column "${key}"`);
            if (systemSeen.has(key)) throw badRequest(`Built-in column "${key}" appears more than once`);
            if (id !== key) throw badRequest(`Built-in column "${key}" must keep its id`);
            systemSeen.add(key);
            const shape = SYSTEM_COLUMN_SHAPE[key];
            return {
                id, name, position, width,
                type: shape.type,
                valueMode: 'MANUAL',
                autoIncrement: null,
                defaultValue: null,
                editable: shape.editable,
                systemKey: key,
            };
        }

        if ((SYSTEM_COLUMN_KEYS as readonly string[]).includes(id)) {
            throw badRequest(`Column id "${id}" is reserved for a built-in column`);
        }

        const type = column.type as ColumnType;
        const valueMode = column.valueMode as ColumnValueMode;
        if (!COLUMN_TYPES.includes(type)) throw badRequest(`Column "${name}" has an invalid type`);
        if (!VALUE_MODES.includes(valueMode)) throw badRequest(`Column "${name}" has an invalid value mode`);
        if (!VALUE_MODE_SUPPORTED_TYPES[valueMode].includes(type)) {
            throw badRequest(`Column "${name}": ${valueMode} is not supported for ${type} columns`);
        }

        let autoIncrement: AutoIncrementConfig | null = null;
        if (valueMode === 'AUTO_INCREMENT') {
            const cfg = column.autoIncrement;
            if (!cfg || !Number.isFinite(cfg.start) || !Number.isFinite(cfg.step)) {
                throw badRequest(`Column "${name}" needs a numeric start value and step`);
            }
            if (cfg.step === 0) throw badRequest(`Column "${name}": step cannot be 0`);
            autoIncrement = { start: cfg.start, step: cfg.step, resetOnColumnId: cfg.resetOnColumnId || null };
        }

        return {
            id, name, type, position, width, valueMode, autoIncrement,
            defaultValue: valueMode === 'MANUAL' ? coerceCellValue(column.defaultValue, type, `Default value of "${name}"`) : null,
            editable: valueMode === 'MANUAL',
            systemKey: null,
        };
    });

    const missing = SYSTEM_COLUMN_KEYS.filter((key) => !systemSeen.has(key));
    if (missing.length) throw badRequest(`Built-in columns cannot be removed: ${missing.join(', ')}`);

    const byId = new Map(columns.map((column) => [column.id, column]));
    for (const column of columns) {
        const ref = column.autoIncrement?.resetOnColumnId;
        if (!ref) continue;
        const target = byId.get(ref);
        if (!target || target.id === column.id || target.systemKey || target.valueMode !== 'MANUAL') {
            throw badRequest(`Column "${column.name}" can only restart numbering based on a manual custom column`);
        }
    }

    return columns;
};

const groupKey = (value: CellValue | undefined) => String(value ?? '').trim().toLowerCase();

/** Generated values for AUTO_INCREMENT columns, aligned with `items` by index. Group headings are skipped. */
export const computeAutoValues = (
    items: { isSection?: boolean; values?: Record<string, CellValue> }[],
    columns: TableColumn[]
): Record<string, number>[] => {
    const result: Record<string, number>[] = items.map(() => ({}));
    for (const column of columns) {
        if (column.valueMode !== 'AUTO_INCREMENT' || !column.autoIncrement) continue;
        const { start, step, resetOnColumnId } = column.autoIncrement;
        let k = -1;
        let previousGroup: string | null = null;
        items.forEach((item, index) => {
            if (item.isSection) return;
            const group = resetOnColumnId ? groupKey(item.values?.[resetOnColumnId]) : null;
            k = k === -1 || (resetOnColumnId && group !== previousGroup) ? 0 : k + 1;
            previousGroup = group;
            result[index][column.id] = Number((start + step * k).toFixed(6));
        });
    }
    return result;
};

/** Mirrors the client reducer: non-numeric (text) quantities count as 1 when present. */
export const calculateAmount = (rawQty: unknown, rawRate: unknown): number => {
    const qty = parseFloat(String(rawQty));
    const rate = parseFloat(String(rawRate)) || 0;
    const effectiveQty = isNaN(qty) ? (rawQty ? 1 : 0) : qty;
    return effectiveQty * rate;
};

export const normalizeItems = (items: TableItemInput[], columns: TableColumn[]): TableItem[] => {
    const manualColumns = columns.filter((column) => !column.systemKey && column.valueMode === 'MANUAL');

    const normalized: TableItem[] = items.map((item, index) => {
        const isSection = !!item.isSection;
        const values: Record<string, CellValue> = {};
        if (!isSection) {
            for (const column of manualColumns) {
                const raw = item.values?.[column.id];
                values[column.id] = raw === undefined
                    ? column.defaultValue ?? null
                    : coerceCellValue(raw, column.type, `"${column.name}" in row ${index + 1}`);
            }
        }
        return {
            pointName: item.pointName,
            description: item.description ?? '',
            qty: item.qty ?? (isSection ? '' : 1),
            unit: item.unit ?? (isSection ? '' : 'Nos'),
            unitId: isSection || !item.unitId ? null : String(item.unitId),
            rate: item.rate ?? 0,
            amount: isSection ? 0 : calculateAmount(item.qty, item.rate),
            isSection,
            values,
        };
    });

    computeAutoValues(normalized, columns).forEach((autoValues, index) => {
        Object.assign(normalized[index].values, autoValues);
    });

    return normalized;
};

export interface ExistingQuotation {
    columns?: Partial<TableColumn>[];
    items?: TableItemInput[];
    gstEnabled?: boolean;
    gstRate?: number;
}

/**
 * Validates table config/row values and recalculates all money fields so the
 * stored document never depends on client-side calculations.
 */
export const prepareQuotationPayload = (body: Record<string, any>, existing?: ExistingQuotation) => {
    const columns = normalizeColumns(body.columns ?? existing?.columns);
    const items = normalizeItems(body.items ?? existing?.items ?? [], columns);
    const gstEnabled = body.gstEnabled ?? existing?.gstEnabled ?? false;
    const gstRate = body.gstRate ?? existing?.gstRate ?? 18;

    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gstAmount = gstEnabled ? (subtotal * gstRate) / 100 : 0;

    return {
        ...body,
        columns,
        items,
        subtotal,
        gstAmount,
        totalAmount: subtotal + gstAmount,
    };
};

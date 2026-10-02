import { AutoIncrementConfig, CellValue, ColumnType, ColumnValueMode, QuotationItem, TableColumn } from '../types';

// Keep in sync with server/src/utils/quotationTable.ts, which re-validates everything on save.
export const MAX_COLUMNS = 20;
export const MAX_COLUMN_NAME_LENGTH = 40;

export const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
    text: 'Text',
    number: 'Number',
};

/** Registry of value modes; adding a mode here makes it available in the column editor. */
export const VALUE_MODES: Record<ColumnValueMode, { label: string; description: string; types: ColumnType[] }> = {
    MANUAL: {
        label: 'Manual entry',
        description: 'Type a value in each row',
        types: ['text', 'number'],
    },
    AUTO_INCREMENT: {
        label: 'Auto increment',
        description: 'Numbered automatically, skipping group headings',
        types: ['number'],
    },
};

export const createDefaultColumns = (): TableColumn[] => [
    { id: 'sr', name: 'Sr. No.', type: 'number', position: 0, width: 64, valueMode: 'AUTO_INCREMENT', autoIncrement: { start: 1, step: 1, resetOnColumnId: null }, defaultValue: null, editable: false, systemKey: null },
    { id: 'description', name: 'Description', type: 'text', position: 1, width: null, valueMode: 'MANUAL', autoIncrement: null, defaultValue: null, editable: true, systemKey: 'description' },
    { id: 'qty', name: 'Qty.', type: 'number', position: 2, width: 170, valueMode: 'MANUAL', autoIncrement: null, defaultValue: null, editable: true, systemKey: 'qty' },
    { id: 'rate', name: 'Rate', type: 'number', position: 3, width: 160, valueMode: 'MANUAL', autoIncrement: null, defaultValue: null, editable: true, systemKey: 'rate' },
    { id: 'amount', name: 'Amount', type: 'number', position: 4, width: 144, valueMode: 'MANUAL', autoIncrement: null, defaultValue: null, editable: false, systemKey: 'amount' },
];

export const createColumnId = () => `col_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

export const isManualCustomColumn = (column: TableColumn) => !column.systemKey && column.valueMode === 'MANUAL';

export const deriveEditable = (column: TableColumn) => column.valueMode === 'MANUAL' && column.systemKey !== 'amount';

/** Sorts, re-indexes positions and repairs config; falls back to the original fixed layout for legacy quotations. */
export const normalizeColumns = (columns?: TableColumn[] | null): TableColumn[] => {
    if (!columns || columns.length === 0) return createDefaultColumns();

    const sorted = [...columns].sort((a, b) => a.position - b.position);
    const defaults = createDefaultColumns();
    for (const fallback of defaults) {
        if (fallback.systemKey && !sorted.some((c) => c.systemKey === fallback.systemKey)) {
            sorted.push(fallback);
        }
    }

    const manualCustomIds = new Set(sorted.filter(isManualCustomColumn).map((c) => c.id));
    return sorted.map((column, position) => {
        const autoIncrement = column.valueMode === 'AUTO_INCREMENT'
            ? {
                start: column.autoIncrement?.start ?? 1,
                step: column.autoIncrement?.step || 1,
                resetOnColumnId: column.autoIncrement?.resetOnColumnId && manualCustomIds.has(column.autoIncrement.resetOnColumnId)
                    ? column.autoIncrement.resetOnColumnId
                    : null,
            }
            : null;
        return { ...column, position, autoIncrement, editable: deriveEditable(column) };
    });
};

export const getDefaultCellValue = (column: TableColumn): CellValue =>
    column.valueMode === 'MANUAL' ? column.defaultValue ?? null : null;

export const buildDefaultValues = (columns: TableColumn[]): Record<string, CellValue> =>
    Object.fromEntries(columns.filter(isManualCustomColumn).map((c) => [c.id, getDefaultCellValue(c)]));

const groupKey = (value: CellValue | undefined) => String(value ?? '').trim().toLowerCase();

/** Generated AUTO_INCREMENT values, aligned with `items` by index. Mirrors the server implementation. */
export const computeAutoValues = (
    items: Pick<QuotationItem, 'isSection' | 'values'>[],
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

export const previewAutoIncrement = (config: AutoIncrementConfig, groups: string[]): number[] => {
    const items = groups.map((group) => ({ isSection: false, values: { group } }));
    const column: TableColumn = {
        id: 'preview', name: 'preview', type: 'number', position: 0, valueMode: 'AUTO_INCREMENT', editable: false,
        autoIncrement: { ...config, resetOnColumnId: config.resetOnColumnId ? 'group' : null },
    };
    return computeAutoValues(items, [column]).map((values) => values.preview);
};

const toNumberOrNull = (value: CellValue | undefined): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = typeof value === 'number' ? value : Number(String(value).trim());
    return Number.isFinite(num) ? num : null;
};

/**
 * Keeps row values consistent with a new column configuration: removed columns lose their values,
 * new manual columns get their default, and columns switched from auto to manual keep their generated numbers.
 */
export const reconcileItemsWithColumns = (
    items: QuotationItem[],
    previousColumns: TableColumn[],
    nextColumns: TableColumn[]
): QuotationItem[] => {
    const previousById = new Map(previousColumns.map((c) => [c.id, c]));
    const previousAuto = computeAutoValues(items, previousColumns);
    const manualColumns = nextColumns.filter(isManualCustomColumn);

    return items.map((item, index) => {
        if (item.isSection) return { ...item, values: {} };
        const values: Record<string, CellValue> = {};
        for (const column of manualColumns) {
            const previous = previousById.get(column.id);
            let value: CellValue | undefined = item.values?.[column.id];
            if (previous && previous.valueMode === 'AUTO_INCREMENT') value = previousAuto[index][column.id] ?? null;
            if (value === undefined) value = getDefaultCellValue(column);
            values[column.id] = column.type === 'number' ? toNumberOrNull(value) : value;
        }
        return { ...item, values };
    });
};

const hasValue = (value: CellValue | undefined) => value !== null && value !== undefined && String(value).trim() !== '';

export const countRowsWithValue = (items: QuotationItem[], columnId: string) =>
    items.filter((item) => !item.isSection && hasValue(item.values?.[columnId])).length;

export const countNonNumericValues = (items: QuotationItem[], columnId: string) =>
    items.filter((item) => !item.isSection && hasValue(item.values?.[columnId]) && toNumberOrNull(item.values?.[columnId]) === null).length;

export const formatCellValue = (value: CellValue | undefined) => (value === null || value === undefined ? '' : String(value));

/** Value shown for a user-defined column in a given row. */
export const resolveCustomCellValue = (
    column: TableColumn,
    item: Pick<QuotationItem, 'values'>,
    autoValues: Record<string, number> | undefined
): CellValue => (column.valueMode === 'AUTO_INCREMENT' ? autoValues?.[column.id] ?? null : item.values?.[column.id] ?? null);

export const validateColumn = (column: TableColumn, allColumns: TableColumn[]): string | null => {
    const name = column.name.trim();
    if (!name) return 'Column name is required';
    if (name.length > MAX_COLUMN_NAME_LENGTH) return `Column name must be at most ${MAX_COLUMN_NAME_LENGTH} characters`;
    if (allColumns.some((c) => c.id !== column.id && c.name.trim().toLowerCase() === name.toLowerCase())) {
        return `A column named "${name}" already exists`;
    }
    if (column.systemKey) return null;
    if (!VALUE_MODES[column.valueMode].types.includes(column.type)) {
        return `${VALUE_MODES[column.valueMode].label} is not available for ${COLUMN_TYPE_LABELS[column.type].toLowerCase()} columns`;
    }
    if (column.valueMode === 'AUTO_INCREMENT') {
        const cfg = column.autoIncrement;
        if (!cfg || !Number.isFinite(cfg.start)) return 'Start value must be a number';
        if (!Number.isFinite(cfg.step) || cfg.step === 0) return 'Step must be a non-zero number';
    }
    if (column.type === 'number' && column.valueMode === 'MANUAL' && hasValue(column.defaultValue) && toNumberOrNull(column.defaultValue) === null) {
        return 'Default value must be a number';
    }
    if (column.width != null && (!Number.isInteger(column.width) || column.width < 40 || column.width > 600)) {
        return 'Width must be a whole number between 40 and 600';
    }
    return null;
};

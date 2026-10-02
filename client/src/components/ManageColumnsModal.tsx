import { useMemo, useState } from 'react';
import Modal from './Modal';
import { ColumnType, ColumnValueMode, QuotationItem, TableColumn } from '../types';
import {
    COLUMN_TYPE_LABELS,
    MAX_COLUMNS,
    VALUE_MODES,
    countNonNumericValues,
    countRowsWithValue,
    createColumnId,
    deriveEditable,
    isManualCustomColumn,
    normalizeColumns,
    previewAutoIncrement,
    validateColumn,
} from '../utils/tableColumns';

interface ManageColumnsModalProps {
    columns: TableColumn[];
    items: QuotationItem[];
    onApply: (columns: TableColumn[]) => void;
    onClose: () => void;
}

const LABEL = 'block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2 ml-1';
const INPUT = 'w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-red-600/20 focus:ring-4 focus:ring-red-600/5 transition-all font-bold text-gray-800 dark:text-gray-100 placeholder-gray-300 disabled:opacity-60';
const ICON_BUTTON = 'w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-30 disabled:pointer-events-none';

const ManageColumnsModal = ({ columns, items, onApply, onClose }: ManageColumnsModalProps) => {
    const [draft, setDraft] = useState<TableColumn[]>(() => normalizeColumns(columns));
    const [editing, setEditing] = useState<{ column: TableColumn; isNew: boolean } | null>(null);
    const [pendingDelete, setPendingDelete] = useState<TableColumn | null>(null);

    const reindex = (list: TableColumn[]) => list.map((column, position) => ({ ...column, position }));

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= draft.length) return;
        const next = [...draft];
        [next[index], next[target]] = [next[target], next[index]];
        setDraft(reindex(next));
    };

    const startAdd = () => {
        setEditing({
            isNew: true,
            column: {
                id: createColumnId(),
                name: '',
                type: 'text',
                position: draft.length,
                width: null,
                valueMode: 'MANUAL',
                autoIncrement: null,
                defaultValue: null,
                editable: true,
                systemKey: null,
            },
        });
    };

    const saveColumn = (column: TableColumn) => {
        if (!editing) return;
        const exists = draft.some((c) => c.id === column.id);
        const next = exists ? draft.map((c) => (c.id === column.id ? column : c)) : [...draft, column];
        setDraft(reindex(next));
        setEditing(null);
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        const removedId = pendingDelete.id;
        setDraft(reindex(
            draft
                .filter((c) => c.id !== removedId)
                .map((c) => (c.autoIncrement?.resetOnColumnId === removedId
                    ? { ...c, autoIncrement: { ...c.autoIncrement, resetOnColumnId: null } }
                    : c))
        ));
        setPendingDelete(null);
    };

    const deleteMessage = useMemo(() => {
        if (!pendingDelete) return '';
        if (pendingDelete.valueMode === 'AUTO_INCREMENT') {
            return `"${pendingDelete.name}" is generated automatically, so no typed data will be lost. You can add it back at any time.`;
        }
        const filled = countRowsWithValue(items, pendingDelete.id);
        const dependents = draft.filter((c) => c.autoIncrement?.resetOnColumnId === pendingDelete.id).map((c) => `"${c.name}"`);
        const parts = [
            filled > 0
                ? `"${pendingDelete.name}" has values in ${filled} row${filled === 1 ? '' : 's'}. They will be permanently deleted when you save this quotation.`
                : `"${pendingDelete.name}" has no values yet.`,
        ];
        if (dependents.length) parts.push(`${dependents.join(', ')} will stop restarting its numbering on this column.`);
        return parts.join(' ');
    }, [pendingDelete, items, draft]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[95vh] overflow-hidden animate-scaleIn border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="shrink-0 px-8 pt-8 pb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                            {editing ? (editing.isNew ? 'Add' : 'Edit') : 'Manage'} <span className="text-red-600">{editing ? 'Column' : 'Columns'}</span>
                        </h2>
                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-1">
                            {editing ? 'Configure how this column is displayed and filled.' : 'Add, reorder, rename or remove table columns. Changes are saved with the quotation.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-all active:scale-90"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5 text-gray-400 dark:text-gray-200" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-6">
                    {editing ? (
                        <ColumnEditor
                            key={editing.column.id}
                            initial={editing.column}
                            isNew={editing.isNew}
                            isApplied={columns.some((c) => c.id === editing.column.id)}
                            allColumns={draft}
                            items={items}
                            onSave={saveColumn}
                            onCancel={() => setEditing(null)}
                        />
                    ) : (
                        <div className="space-y-2">
                            {draft.map((column, index) => (
                                <div
                                    key={column.id}
                                    className="flex items-center gap-2 p-3 pl-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 hover:border-red-600/30 transition-all"
                                >
                                    <div className="flex flex-col">
                                        <button type="button" className={`${ICON_BUTTON} h-6`} onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${column.name} left`} title="Move left">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                                        </button>
                                        <button type="button" className={`${ICON_BUTTON} h-6`} onClick={() => move(index, 1)} disabled={index === draft.length - 1} aria-label={`Move ${column.name} right`} title="Move right">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-gray-800 dark:text-gray-100 truncate">{column.name}</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {column.systemKey ? (
                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-200/70 dark:bg-gray-700 text-gray-500 dark:text-gray-300">Built-in</span>
                                            ) : (
                                                <>
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">{COLUMN_TYPE_LABELS[column.type]}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300">
                                                        {VALUE_MODES[column.valueMode].label}
                                                        {column.autoIncrement && ` · ${column.autoIncrement.start}, +${column.autoIncrement.step}`}
                                                    </span>
                                                    {column.autoIncrement?.resetOnColumnId && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300">
                                                            Restarts per {draft.find((c) => c.id === column.autoIncrement?.resetOnColumnId)?.name}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button type="button" className={ICON_BUTTON} onClick={() => setEditing({ column, isNew: false })} aria-label={`Edit ${column.name}`} title="Edit column">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    {column.systemKey ? (
                                        <span className={`${ICON_BUTTON} cursor-help`} title="Built-in columns are required for amount calculation and cannot be deleted">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </span>
                                    ) : (
                                        <button type="button" className={`${ICON_BUTTON} hover:!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/30`} onClick={() => setPendingDelete(column)} aria-label={`Delete ${column.name}`} title="Delete column">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={startAdd}
                                disabled={draft.length >= MAX_COLUMNS}
                                className="w-full mt-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 font-bold hover:border-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                {draft.length >= MAX_COLUMNS ? `Maximum of ${MAX_COLUMNS} columns reached` : 'Add Column'}
                            </button>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium pt-2 ml-1">
                                The Action column is always shown last. Built-in columns can be renamed and moved, but not deleted.
                            </p>
                        </div>
                    )}
                </div>

                {!editing && (
                    <div className="shrink-0 px-8 py-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-gray-400 dark:text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onApply(draft)}
                            className="px-8 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-red-700 active:scale-95 transition-all"
                        >
                            Apply Changes
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!pendingDelete}
                onClose={() => setPendingDelete(null)}
                onConfirm={confirmDelete}
                title={`Delete "${pendingDelete?.name ?? ''}"?`}
                message={deleteMessage}
                type="warning"
            />
        </div>
    );
};

interface ColumnEditorProps {
    initial: TableColumn;
    isNew: boolean;
    isApplied: boolean;
    allColumns: TableColumn[];
    items: QuotationItem[];
    onSave: (column: TableColumn) => void;
    onCancel: () => void;
}

const PREVIEW_GROUPS = ['B', 'B', 'B', 'C', 'C'];

const ColumnEditor = ({ initial, isNew, isApplied, allColumns, items, onSave, onCancel }: ColumnEditorProps) => {
    const isSystem = !!initial.systemKey;
    const [name, setName] = useState(initial.name);
    const [type, setType] = useState<ColumnType>(initial.type);
    const [valueMode, setValueMode] = useState<ColumnValueMode>(initial.valueMode);
    const [start, setStart] = useState(String(initial.autoIncrement?.start ?? 1));
    const [step, setStep] = useState(String(initial.autoIncrement?.step ?? 1));
    const [resetOnColumnId, setResetOnColumnId] = useState(initial.autoIncrement?.resetOnColumnId ?? '');
    const [defaultValue, setDefaultValue] = useState(initial.defaultValue == null ? '' : String(initial.defaultValue));
    const [width, setWidth] = useState(initial.width == null ? '' : String(initial.width));
    const [error, setError] = useState<string | null>(null);

    const resetCandidates = allColumns.filter((c) => c.id !== initial.id && isManualCustomColumn(c));

    const changeType = (nextType: ColumnType) => {
        setType(nextType);
        if (!VALUE_MODES[valueMode].types.includes(nextType)) setValueMode('MANUAL');
    };

    const buildColumn = (): TableColumn => {
        const isAuto = !isSystem && valueMode === 'AUTO_INCREMENT';
        const trimmedDefault = defaultValue.trim();
        const column: TableColumn = {
            ...initial,
            name: name.trim(),
            type: isSystem ? initial.type : type,
            valueMode: isSystem ? initial.valueMode : valueMode,
            width: width.trim() === '' ? null : Number(width),
            autoIncrement: isAuto
                ? { start: start.trim() === '' ? NaN : Number(start), step: step.trim() === '' ? NaN : Number(step), resetOnColumnId: resetOnColumnId || null }
                : null,
            defaultValue: isSystem || isAuto || trimmedDefault === ''
                ? null
                : type === 'number' ? Number(trimmedDefault) : defaultValue,
        };
        return { ...column, editable: deriveEditable(column) };
    };

    const handleSave = () => {
        const column = buildColumn();
        const validationError = validateColumn(column, allColumns);
        if (validationError) return setError(validationError);
        onSave(column);
    };

    const startNum = Number(start);
    const stepNum = Number(step);
    const previewValid = start.trim() !== '' && step.trim() !== '' && Number.isFinite(startNum) && Number.isFinite(stepNum) && stepNum !== 0;
    const previewGroups = resetOnColumnId ? PREVIEW_GROUPS : PREVIEW_GROUPS.map(() => '');
    const preview = previewValid ? previewAutoIncrement({ start: startNum, step: stepNum, resetOnColumnId: resetOnColumnId || null }, previewGroups) : [];
    const resetColumnName = resetCandidates.find((c) => c.id === resetOnColumnId)?.name;

    const filledRows = isApplied ? countRowsWithValue(items, initial.id) : 0;
    const nonNumericRows = isApplied ? countNonNumericValues(items, initial.id) : 0;
    const warnings: string[] = [];
    if (!isSystem && initial.valueMode === 'MANUAL' && valueMode === 'AUTO_INCREMENT' && filledRows > 0) {
        warnings.push(`${filledRows} row${filledRows === 1 ? '' : 's'} with typed values will be replaced by generated numbers.`);
    }
    if (!isSystem && initial.type === 'text' && type === 'number' && valueMode === 'MANUAL' && nonNumericRows > 0) {
        warnings.push(`${nonNumericRows} row${nonNumericRows === 1 ? '' : 's'} contain non-numeric values that will be cleared.`);
    }

    return (
        <div className="space-y-6 pt-2">
            <div>
                <label htmlFor="columnName" className={LABEL}>Column Name</label>
                <input
                    id="columnName"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(null); }}
                    className={INPUT}
                    placeholder="e.g. Category, Sr No, Unit"
                    autoFocus
                />
            </div>

            {isSystem ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    This is a built-in column used for amount calculation. You can rename it, resize it and change its position.
                </p>
            ) : (
                <>
                    <div>
                        <span className={LABEL}>Column Type</span>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(COLUMN_TYPE_LABELS) as ColumnType[]).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => { changeType(option); setError(null); }}
                                    className={`py-3 rounded-xl text-sm font-black transition-all border-2 ${type === option ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}
                                >
                                    {COLUMN_TYPE_LABELS[option]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className={LABEL}>Value Mode</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(Object.keys(VALUE_MODES) as ColumnValueMode[]).map((mode) => {
                                const supported = VALUE_MODES[mode].types.includes(type);
                                return (
                                    <button
                                        key={mode}
                                        type="button"
                                        disabled={!supported}
                                        onClick={() => { setValueMode(mode); setError(null); }}
                                        className={`text-left p-4 rounded-xl transition-all border-2 disabled:opacity-40 disabled:cursor-not-allowed ${valueMode === mode ? 'border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
                                        title={supported ? undefined : `Only available for ${VALUE_MODES[mode].types.map((t) => COLUMN_TYPE_LABELS[t].toLowerCase()).join(' / ')} columns`}
                                    >
                                        <span className={`block font-black text-sm ${valueMode === mode ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>{VALUE_MODES[mode].label}</span>
                                        <span className="block text-xs text-gray-400 font-medium mt-0.5">{VALUE_MODES[mode].description}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {valueMode === 'AUTO_INCREMENT' ? (
                        <div className="space-y-4 rounded-2xl p-5 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="autoStart" className={LABEL}>Start Value</label>
                                    <input id="autoStart" type="number" value={start} onChange={(e) => { setStart(e.target.value); setError(null); }} className={`${INPUT} bg-white dark:bg-gray-800`} />
                                </div>
                                <div>
                                    <label htmlFor="autoStep" className={LABEL}>Increment / Step</label>
                                    <input id="autoStep" type="number" value={step} onChange={(e) => { setStep(e.target.value); setError(null); }} className={`${INPUT} bg-white dark:bg-gray-800`} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="autoReset" className={LABEL}>Restart Numbering</label>
                                <select
                                    id="autoReset"
                                    value={resetOnColumnId}
                                    onChange={(e) => setResetOnColumnId(e.target.value)}
                                    className={`${INPUT} bg-white dark:bg-gray-800`}
                                    disabled={resetCandidates.length === 0}
                                >
                                    <option value="">Never (continuous numbering)</option>
                                    {resetCandidates.map((c) => (
                                        <option key={c.id} value={c.id}>When "{c.name}" changes</option>
                                    ))}
                                </select>
                                {resetCandidates.length === 0 && (
                                    <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Add a manual column (e.g. "Category") to restart numbering per group.</p>
                                )}
                            </div>
                            <div>
                                <span className={LABEL}>Preview</span>
                                {preview.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {preview.map((value, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-black text-gray-700 dark:text-gray-200 tabular-nums">
                                                {resetOnColumnId && <span className="text-gray-400 font-bold mr-1.5">{resetColumnName}: {previewGroups[i]}</span>}
                                                {value}
                                            </span>
                                        ))}
                                        <span className="px-2 py-1.5 text-gray-400 font-black">…</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 ml-1">Enter a start value and a non-zero step to see a preview.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="defaultValue" className={LABEL}>Default Value <span className="normal-case tracking-normal font-bold">(optional)</span></label>
                            <input
                                id="defaultValue"
                                type={type === 'number' ? 'number' : 'text'}
                                value={defaultValue}
                                onChange={(e) => { setDefaultValue(e.target.value); setError(null); }}
                                className={INPUT}
                                placeholder={type === 'number' ? 'e.g. 0' : 'e.g. B'}
                            />
                            <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
                                {isApplied ? 'Used for rows added from now on.' : 'Existing rows and new rows will start with this value.'}
                            </p>
                        </div>
                    )}
                </>
            )}

            <div>
                <label htmlFor="columnWidth" className={LABEL}>Width in px <span className="normal-case tracking-normal font-bold">(optional)</span></label>
                <input
                    id="columnWidth"
                    type="number"
                    value={width}
                    onChange={(e) => { setWidth(e.target.value); setError(null); }}
                    className={INPUT}
                    placeholder="Auto"
                    min={40}
                    max={600}
                />
            </div>

            {warnings.map((warning) => (
                <div key={warning} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-semibold">
                    {warning} This becomes permanent when you save the quotation.
                </div>
            ))}

            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold" role="alert">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-6 py-3 text-gray-400 dark:text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                    {isNew ? 'Add Column' : 'Save Column'}
                </button>
            </div>
        </div>
    );
};

export default ManageColumnsModal;

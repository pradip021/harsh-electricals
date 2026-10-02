import { useState, FC } from 'react';
import { CustomUnit } from '../types';
import { useUnits } from '../context/UnitsContext';
import { MAX_UNIT_NAME_LENGTH, normalizeUnitName, validateUnitName } from '../utils/units';

interface CustomUnitModalProps {
    /** When set, the modal edits this unit; otherwise it creates a new one. */
    unit?: CustomUnit | null;
    /** Rows in the current quotation using `unit` (deletion is blocked while > 0). */
    usageCount?: number;
    onClose: () => void;
    onSaved?: (unit: CustomUnit) => void;
}

const CustomUnitModal: FC<CustomUnitModalProps> = ({ unit, usageCount = 0, onClose, onSaved }) => {
    const { customUnits, createUnit, updateUnit, deleteUnit } = useUnits();
    const isEdit = !!unit;
    const [name, setName] = useState(unit?.name ?? '');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const handleSubmit = async () => {
        if (saving) return;
        const normalized = normalizeUnitName(name);
        if (isEdit && normalized === unit!.name) return onClose();

        const validationError = validateUnitName(normalized, customUnits, unit?._id);
        if (validationError) return setError(validationError);

        setSaving(true);
        try {
            const saved = isEdit ? await updateUnit(unit!._id, normalized) : await createUnit(normalized);
            onSaved?.(saved);
            onClose();
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!unit || saving) return;
        setSaving(true);
        try {
            await deleteUnit(unit._id);
            onClose();
        } catch (err: any) {
            setError(err.message);
            setConfirmingDelete(false);
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn border border-gray-100 dark:border-gray-700">
                {/* Not a <form>: this modal renders inside the quotation editor's form. */}
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight uppercase">{isEdit ? 'Edit Unit' : 'Custom Unit'}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Close">
                            <svg className="w-5 h-5" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                            {isEdit
                                ? 'Renaming updates every item that uses this unit, including saved quotations.'
                                : 'Define a reusable unit. It becomes available for every item; only this item will use it now.'}
                        </p>

                        <div>
                            <label htmlFor="customUnitName" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 pl-1">Unit Name</label>
                            <input
                                id="customUnitName"
                                autoFocus
                                type="text"
                                value={name}
                                maxLength={MAX_UNIT_NAME_LENGTH + 10}
                                onChange={(e) => { setName(e.target.value); setError(null); }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                placeholder="e.g. Rolls, Bags..."
                                aria-invalid={!!error}
                                className={`w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-800 dark:text-white ${error ? 'border-red-500' : 'border-gray-100 dark:border-gray-700'}`}
                            />
                            {error && <p className="mt-2 pl-1 text-xs font-bold text-red-600" role="alert">{error}</p>}
                        </div>

                        {isEdit && (
                            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/60 dark:bg-gray-900/40">
                                {usageCount > 0 ? (
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Used by {usageCount} item{usageCount === 1 ? '' : 's'} in this quotation. Change {usageCount === 1 ? 'it' : 'them'} to another unit before deleting.
                                    </p>
                                ) : confirmingDelete ? (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Delete "{unit!.name}"? This cannot be undone.</p>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setConfirmingDelete(false)} className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-[10px] font-black uppercase tracking-widest">Keep</button>
                                            <button type="button" onClick={handleDelete} disabled={saving} className="flex-1 px-3 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50">Delete</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => { setConfirmingDelete(true); setError(null); }} className="text-xs font-black text-red-600 hover:underline uppercase tracking-widest">
                                        Delete unit
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all font-black text-xs uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-700 active:scale-95 transition-all disabled:opacity-60"
                            >
                                {saving ? 'Saving…' : 'Save Unit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomUnitModal;

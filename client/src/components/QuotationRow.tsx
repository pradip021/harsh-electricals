import { useState, memo } from 'react';
import { useUnits } from '../hooks/useUnits';
import UnitDropdown from './UnitDropdown';
import CustomUnitModal from './CustomUnitModal';
import { QuotationItem } from '../types';

interface QuotationRowProps {
    item: QuotationItem & { srNo: number | '#' };
    srNo: number | '#';
    index: number;
    onUpdate: (id: string, field: keyof QuotationItem, value: any) => void;
    onRemove: (id: string) => void;
    canRemove: boolean;
    showValidationErrors: boolean;
}

const QuotationRow = memo(({ item, srNo, onUpdate, onRemove, canRemove, showValidationErrors }: QuotationRowProps) => {
    const { units, addUnit } = useUnits();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFieldChange = (field: keyof QuotationItem, value: any) => {
        onUpdate(item.id, field, value);
    };

    const handleSaveCustomUnit = (newUnit: string) => {
        addUnit(newUnit);
        handleFieldChange('unit', newUnit);
    };

    const pointInvalid = showValidationErrors && !item.pointName?.trim();
    const qtyInvalid = showValidationErrors && !item.isSection && !String(item.qty).trim();
    const rateInvalid = showValidationErrors && !item.isSection && (parseFloat(String(item.rate)) || 0) <= 0;

    if (item.isSection) {
        return (
            <tr className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/40 dark:to-gray-800/10 border-y border-gray-200 dark:border-gray-700 group/section">
                <td className="px-4 py-4 text-center border-l-4 border-red-600 bg-red-50/50 dark:bg-red-900/10 align-middle">
                    <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                </td>
                <td colSpan={4} className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={item.pointName}
                            onChange={(e) => handleFieldChange('pointName', e.target.value)}
                            className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border hover:border-red-200 dark:hover:border-red-900/30 focus:border-red-500 rounded-lg px-4 py-2 focus:ring-4 focus:ring-red-500/10 text-base font-black text-gray-800 dark:text-red-400 placeholder-gray-400 uppercase tracking-widest transition-all outline-none shadow-inner ${pointInvalid ? 'border-red-500 shadow-red-500/20 animate-shake' : 'border-gray-200 dark:border-transparent'}`}
                            placeholder="SECTION NAME (E.G. LIVING ROOM, KITCHEN, LABOUR...)"
                            title="Group items under this heading"
                        />
                    </div>
                </td>
                <td className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 align-middle">
                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all duration-200"
                        title="Remove this category"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            </tr>
        );
    }

    // Determine mode based on unit
    const isTextMode = item.unit === 'Text' || item.unit === 'LS';
    const showStepper = !isTextMode;

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
            {/* Serial Number */}
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300 align-middle">
                {srNo}
            </td>

            {/* Point Name & Description */}
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 align-middle">
                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        value={item.pointName}
                        onChange={(e) => handleFieldChange('pointName', e.target.value)}
                        className={`w-full px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${pointInvalid ? 'border-red-500 shadow-red-500/10 animate-shake' : 'border-gray-200 dark:border-gray-600'}`}
                        placeholder="Enter point name (e.g. Light Point)"
                    />
                    <textarea
                        value={item.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/30 transition-all resize-none overflow-hidden"
                        placeholder="Short description or specifications..."
                        rows={1}
                        onInput={(e: any) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                </div>
            </td>

            {/* Quantity */}
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 min-w-[170px] align-middle">
                <div className="flex flex-col gap-1.5 font-bold">
                    <div className={`flex items-center bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden transition-all duration-300 hover:border-red-200 dark:hover:border-red-900/30 ${isTextMode ? 'w-full' : 'max-w-[130px] mx-auto'} ${qtyInvalid ? 'border-red-500 shadow-red-500/10 animate-shake' : 'border-gray-200 dark:border-gray-700'}`}>
                        {showStepper && (
                            <button
                                type="button"
                                onClick={() => {
                                    const val = parseFloat(String(item.qty)) || 0;
                                    if (val > 0) handleFieldChange('qty', val - 1);
                                }}
                                className="w-8 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                            </button>
                        )}
                        <input
                            type={isTextMode ? "text" : "number"}
                            value={item.qty}
                            onChange={(e) => handleFieldChange('qty', isTextMode ? e.target.value : (parseFloat(e.target.value) || 0))}
                            className={`flex-1 min-w-0 h-9 bg-transparent text-center font-extrabold text-xs text-gray-800 dark:text-gray-100 focus:outline-none appearance-none ${isTextMode ? 'px-3 text-left' : ''}`}
                            placeholder={isTextMode ? "Description..." : "0"}
                        />
                        {showStepper && (
                            <button
                                type="button"
                                onClick={() => {
                                    const val = parseFloat(String(item.qty)) || 0;
                                    handleFieldChange('qty', val + 1);
                                }}
                                className="w-8 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        )}
                    </div>

                    <UnitDropdown
                        value={item.unit}
                        options={units}
                        onChange={(val) => handleFieldChange('unit', val)}
                        onAddCustom={() => setIsModalOpen(true)}
                    />
                </div>

                <CustomUnitModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCustomUnit}
                />
            </td>

            {/* Rate */}
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 align-middle">
                <div className={`flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl border shadow-sm overflow-hidden w-full max-w-[140px] mx-auto transition-all duration-300 hover:shadow-md hover:border-red-200 dark:hover:border-red-900/30 ${rateInvalid ? 'border-red-500 shadow-red-500/10 animate-shake' : 'border-gray-200 dark:border-gray-700'}`}>
                    <button
                        type="button"
                        onClick={() => {
                            const val = parseFloat(String(item.rate)) || 0;
                            if (val > 0) handleFieldChange('rate', val - 1);
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                    </button>
                    <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleFieldChange('rate', parseFloat(e.target.value) || 0)}
                        className="flex-1 min-w-0 h-10 bg-transparent text-center font-black text-gray-800 dark:text-gray-100 focus:outline-none appearance-none"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const val = parseFloat(String(item.rate)) || 0;
                            handleFieldChange('rate', val + 1);
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
            </td>

            {/* Amount */}
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center font-black text-gray-800 dark:text-gray-100 align-middle">
                ₹{(item.amount || 0).toFixed(2)}
            </td>

            {/* Actions */}
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center">
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                        aria-label="Remove row"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </td>
        </tr >
    );
});

QuotationRow.displayName = 'QuotationRow';

export default QuotationRow;

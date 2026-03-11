import { memo, useState } from 'react';
import QuotationRow from './QuotationRow';
import { useUnits } from '../hooks/useUnits';
import UnitDropdown from './UnitDropdown';
import CustomUnitModal from './CustomUnitModal';
import { QuotationItem } from '../types';

interface QuotationTableProps {
    items: QuotationItem[];
    onUpdateItem: (id: string, field: keyof QuotationItem, value: any) => void;
    onRemoveItem: (id: string) => void;
    onAddItem: () => void;
    onAddSection: () => void;
    showValidationErrors: boolean;
}

const QuotationTable = memo(({ items, onUpdateItem, onRemoveItem, onAddItem, onAddSection, showValidationErrors }: QuotationTableProps) => {
    const { units, addUnit } = useUnits();

    // Calculate serial numbers for display (skipping sections)
    const itemsWithSr = items.map((item, idx) => {
        if (item.isSection) return { ...item, srNo: '#' as const };
        // Count all non-section items up to this index
        const srNo = items.slice(0, idx + 1).filter(i => !i.isSection).length;
        return { ...item, srNo };
    });

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 bg-white dark:bg-gray-800 overflow-visible">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-visible relative">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-200/50 dark:bg-gray-800/50 border-b-2 border-red-600">
                            <th className="px-4 py-5 text-center font-black text-[10px] text-slate-700 dark:text-gray-300 uppercase tracking-widest w-16 align-middle">Sr.</th>
                            <th className="px-4 py-5 text-left font-black text-[10px] text-slate-700 dark:text-gray-300 uppercase tracking-widest align-middle">Description</th>
                            <th className="px-4 py-5 text-center font-black text-[10px] text-slate-700 dark:text-gray-300 uppercase tracking-widest w-30 align-middle text-nowrap">Qty. (Unit)</th>
                            <th className="px-4 py-5 text-center font-black text-[10px] text-slate-700 dark:text-gray-300 uppercase tracking-widest w-32 align-middle">Rate (₹)</th>
                            <th className="px-4 py-5 text-center font-black text-[10px] text-slate-700 dark:text-gray-300 uppercase tracking-widest w-36 align-middle">Amount (₹)</th>
                            <th className="px-4 py-5 text-center font-black text-[10px] text-slate-700 dark:text-gray-300 uppercase tracking-widest w-20 align-middle">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsWithSr.map((item, index) => (
                            <QuotationRow
                                key={item.id}
                                item={item as any}
                                srNo={item.srNo}
                                index={index}
                                onUpdate={onUpdateItem}
                                onRemove={onRemoveItem}
                                canRemove={items.length > 1}
                                showValidationErrors={showValidationErrors}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4 text-left">
                {itemsWithSr.map((item) => (
                    <MobileQuotationCard
                        key={item.id}
                        item={item as any}
                        units={units}
                        addUnit={addUnit}
                        onUpdate={onUpdateItem}
                        onRemove={onRemoveItem}
                        canRemove={items.length > 1}
                        showValidationErrors={showValidationErrors}
                    />
                ))}
            </div>

            {/* Add Row Button */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 rounded-b-xl flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={onAddItem}
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:border-red-600 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add New Row</span>
                </button>
                <button
                    type="button"
                    onClick={onAddSection}
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 font-bold hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 flex flex-col items-center justify-center space-y-1 group"
                >
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <span>Add Group Heading (Category)</span>
                    </div>
                    <span className="text-[10px] opacity-60 font-medium">Use for grouping items like "Materials" or "Labour charges"</span>
                </button>
            </div>
        </div>
    );
});

interface MobileQuotationCardProps {
    item: QuotationItem & { srNo: number | '#' };
    units: string[];
    addUnit: (unit: string) => void;
    onUpdate: (id: string, field: keyof QuotationItem, value: any) => void;
    onRemove: (id: string) => void;
    canRemove: boolean;
    showValidationErrors: boolean;
}

// Mobile Sub-component
const MobileQuotationCard = memo(({ item, units, addUnit, onUpdate, onRemove, canRemove, showValidationErrors }: MobileQuotationCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isTextMode = item.unit === 'Text' || item.unit === 'LS';
    const showStepper = !isTextMode;

    const pointInvalid = showValidationErrors && !item.pointName?.trim();
    const qtyInvalid = showValidationErrors && !item.isSection && !String(item.qty).trim();
    const rateInvalid = showValidationErrors && !item.isSection && (parseFloat(String(item.rate)) || 0) <= 0;

    if (item.isSection) {
        return (
            <div className={`bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-3 shadow-lg flex justify-between items-center border-l-8 border-red-800 transition-all ${pointInvalid ? 'ring-4 ring-red-500/50 animate-shake' : ''}`}>
                <input
                    type="text"
                    value={item.pointName}
                    onChange={(e) => onUpdate(item.id, 'pointName', e.target.value)}
                    className="bg-transparent border-none text-white font-black uppercase tracking-widest focus:ring-0 w-full text-sm placeholder-white/50"
                    placeholder="SECTION HEADER"
                />
                <button onClick={() => onRemove(item.id)} className="text-white/60 hover:text-white p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <span className="bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-100 dark:border-red-800/50 uppercase tracking-tighter">
                    ITEM #{item.srNo}
                </span>
                {canRemove && (
                    <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                )}
            </div>

            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Point Name</label>
                <input
                    type="text"
                    value={item.pointName}
                    onChange={(e) => onUpdate(item.id, 'pointName', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all ${pointInvalid ? 'border-red-500 shadow-red-500/20 ring-2 ring-red-500/10' : 'border-gray-100 dark:border-gray-700'}`}
                    placeholder="Enter point name"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                    <div className={`flex bg-gray-50 dark:bg-gray-900/50 rounded-xl border overflow-hidden transition-all ${qtyInvalid ? 'border-red-500 shadow-red-500/20' : 'border-gray-100 dark:border-gray-700'}`}>
                        {showStepper && (
                            <button onClick={() => onUpdate(item.id, 'qty', Math.max(0, (parseFloat(String(item.qty)) || 0) - 1))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg></button>
                        )}
                        <input
                            type={isTextMode ? "text" : "number"}
                            value={item.qty}
                            onChange={(e) => onUpdate(item.id, 'qty', isTextMode ? e.target.value : (parseFloat(e.target.value) || 0))}
                            className="flex-1 bg-transparent text-center font-bold text-sm text-gray-800 dark:text-white outline-none min-w-0"
                        />
                        {showStepper && (
                            <button onClick={() => onUpdate(item.id, 'qty', (parseFloat(String(item.qty)) || 0) + 1)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                    <UnitDropdown
                        value={item.unit}
                        options={units}
                        onChange={(val) => onUpdate(item.id, 'unit', val)}
                        onAddCustom={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 block">
                        Rate (per unit)
                    </label>
                    <div className={`flex items-center bg-gray-50 dark:bg-gray-900/80 rounded-xl border px-3 py-2.5 w-32 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all ${rateInvalid ? 'border-red-500 shadow-red-500/20 ring-2 ring-red-500/10' : 'border-gray-200 dark:border-gray-700'}`}>
                        <span className="text-gray-400 dark:text-gray-500 font-bold mr-1 text-sm">₹</span>
                        <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => onUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="bg-transparent font-black text-base text-gray-800 dark:text-white outline-none w-full"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">
                        Total Amount
                    </span>
                    <span className="text-2xl font-black text-red-600 dark:text-red-500 tabular-nums tracking-tighter">
                        ₹{(item.amount || 0).toFixed(2)}
                    </span>
                </div>
            </div>

            <CustomUnitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(newUnit) => { addUnit(newUnit); onUpdate(item.id, 'unit', newUnit); }}
            />
        </div>
    );
});
MobileQuotationCard.displayName = 'MobileQuotationCard';

QuotationTable.displayName = 'QuotationTable';

export default QuotationTable;

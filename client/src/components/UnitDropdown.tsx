import { useState, useRef, useEffect, FC, ReactNode } from 'react';
import { CustomUnit } from '../types';
import { SYSTEM_UNIT_GROUPS, SYSTEM_UNIT_LABELS, UnitSelection, unitNameKey } from '../utils/units';

interface UnitDropdownProps {
    value: string;
    unitId?: string | null;
    customUnits: CustomUnit[];
    /** Number of rows "Apply to all items" would change. */
    applicableCount: number;
    onChange: (selection: UnitSelection, applyToAll: boolean) => void;
    onAddCustom: () => void;
    onEditCustom: (unit: CustomUnit) => void;
}

const UnitDropdown: FC<UnitDropdownProps> = ({ value, unitId, customUnits, applicableCount, onChange, onAddCustom, onEditCustom }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [applyToAll, setApplyToAll] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = () => {
        // Bulk changes must be opted into every time the menu is opened.
        if (!isOpen) setApplyToAll(false);
        setIsOpen(!isOpen);
    };

    const handleSelect = (selection: UnitSelection) => {
        onChange(selection, applyToAll);
        setIsOpen(false);
    };

    const isCustomSelected = (unit: CustomUnit) =>
        unitId ? unitId === unit._id : unitNameKey(value || '') === unitNameKey(unit.name);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggle}
                className="w-full h-8 px-3 flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-extrabold text-gray-700 dark:text-gray-200 hover:border-red-500 transition-all uppercase tracking-wider shadow-sm group"
            >
                <span className="truncate">
                    {!unitId && value === 'Nos' ? 'Quantity' : !unitId && (value === 'Text' || value === 'LS') ? 'Description' : value}
                </span>
                <svg className={`w-3 h-3 text-gray-400 group-hover:text-red-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-[999] bottom-full mb-1 left-0 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1 animate-slideIn">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 rounded-t-xl">
                        {SYSTEM_UNIT_GROUPS.map((group, index) => (
                            <Section key={group.title} title={group.title} showDivider={index > 0}>
                                {group.units.map((unit) => (
                                    <UnitOption
                                        key={unit}
                                        label={SYSTEM_UNIT_LABELS[unit] ?? unit}
                                        selected={!unitId && value === unit}
                                        onSelect={() => handleSelect({ unit, unitId: null })}
                                    />
                                ))}
                            </Section>
                        ))}
                        {customUnits.length > 0 && (
                            <Section title="Custom" showDivider>
                                {customUnits.map((unit) => (
                                    <UnitOption
                                        key={unit._id}
                                        label={unit.name}
                                        selected={isCustomSelected(unit)}
                                        onSelect={() => handleSelect({ unit: unit.name, unitId: unit._id })}
                                        onEdit={() => { setIsOpen(false); onEditCustom(unit); }}
                                    />
                                ))}
                            </Section>
                        )}
                    </div>

                    {applicableCount > 1 && (
                        <label className={`flex items-start gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-700 cursor-pointer select-none transition-colors ${applyToAll ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                            <input
                                type="checkbox"
                                checked={applyToAll}
                                onChange={(e) => setApplyToAll(e.target.checked)}
                                className="mt-0.5 w-3.5 h-3.5 accent-red-600 cursor-pointer"
                            />
                            <span className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">Apply to all items ({applicableCount})</span>
                                <span className="text-[9px] font-semibold text-gray-400 normal-case">
                                    {applyToAll ? 'Your next pick changes every item in this quotation' : 'Off: only this item changes'}
                                </span>
                            </span>
                        </label>
                    )}

                    <button
                        type="button"
                        onClick={() => { setIsOpen(false); onAddCustom(); }}
                        className="w-full px-3 py-2 text-left text-[10px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-b-xl"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        + NEW UNIT
                    </button>
                </div>
            )}
        </div>
    );
};

interface SectionProps {
    title: string;
    showDivider?: boolean;
    children: ReactNode;
}

const Section: FC<SectionProps> = ({ title, showDivider, children }) => (
    <div className={`mb-1 ${showDivider ? 'border-t border-gray-300 dark:border-gray-700 mt-1 pt-2' : ''}`}>
        <div className="px-3 py-1 text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-700/50 mb-1">{title}</div>
        {children}
    </div>
);

interface UnitOptionProps {
    label: string;
    selected: boolean;
    onSelect: () => void;
    onEdit?: () => void;
}

const UnitOption: FC<UnitOptionProps> = ({ label, selected, onSelect, onEdit }) => (
    <div className={`group/option flex items-center transition-colors ${selected ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
        <button
            type="button"
            onClick={onSelect}
            className={`flex-1 min-w-0 px-6 py-1.5 text-left text-[11px] font-semibold truncate transition-colors ${selected ? 'text-red-600' : 'text-gray-700 dark:text-gray-300 hover:text-red-500'}`}
        >
            {label}
        </button>
        {onEdit && (
            <button
                type="button"
                onClick={onEdit}
                className="shrink-0 mr-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 opacity-60 group-hover/option:opacity-100 transition-all"
                title={`Edit "${label}"`}
            >
                Edit
            </button>
        )}
    </div>
);

export default UnitDropdown;

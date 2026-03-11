import { useState, useRef, useEffect, FC } from 'react';

interface UnitDropdownProps {
    value: string;
    options: string[];
    onChange: (unit: string) => void;
    onAddCustom: () => void;
}

const UnitDropdown: FC<UnitDropdownProps> = ({ value, options, onChange, onAddCustom }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const mainUnitsList = ['Nos', 'Pcs', 'Mtr'];
    const measureUnitsList = ['RF', 'SqFt', 'LS', 'Text'];

    const mainUnits = options.filter(u => mainUnitsList.includes(u));
    const measureUnits = options.filter(u => measureUnitsList.includes(u));
    const customUnits = options.filter(u => !mainUnitsList.includes(u) && !measureUnitsList.includes(u));

    const handleSelect = (unit: string) => {
        onChange(unit);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-8 px-3 flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-extrabold text-gray-700 dark:text-gray-200 hover:border-red-500 transition-all uppercase tracking-wider shadow-sm group"
            >
                <span className="truncate">
                    {value === 'Nos' ? 'Quantity' : (value === 'Text' || value === 'LS') ? 'Description' : value}
                </span>
                <svg className={`w-3 h-3 text-gray-400 group-hover:text-red-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-[999] bottom-full mb-1 left-0 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1 animate-slideIn">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 rounded-t-xl">
                        <Section title="Standard" units={mainUnits} value={value} onSelect={handleSelect} />
                        <Section title="Format" units={measureUnits} value={value} onSelect={handleSelect} showDivider />
                        {customUnits.length > 0 && <Section title="Custom" units={customUnits} value={value} onSelect={handleSelect} showDivider />}
                    </div>

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
    units: string[];
    value: string;
    onSelect: (unit: string) => void;
    showDivider?: boolean;
}

const Section: FC<SectionProps> = ({ title, units, value, onSelect, showDivider }) => (
    <div className={`mb-1 ${showDivider ? 'border-t border-gray-300 dark:border-gray-700 mt-1 pt-2' : ''}`}>
        <div className="px-3 py-1 text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-700/50 mb-1">{title}</div>
        {units.map(unit => (
            <button
                key={unit}
                type="button"
                onClick={() => onSelect(unit)}
                className={`w-full px-6 py-1.5 text-left text-[11px] font-semibold transition-colors ${value === unit ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-500'}`}
            >
                {unit === 'Nos' ? 'Quantity (Nos)' : unit === 'Text' ? 'Descriptive Text' : unit === 'LS' ? 'Lump Sum (LS)' : unit}
            </button>
        ))}
    </div>
);

export default UnitDropdown;

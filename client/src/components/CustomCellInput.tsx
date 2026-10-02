import { memo } from 'react';
import { CellValue, TableColumn } from '../types';
import { formatCellValue } from '../utils/tableColumns';

interface CustomCellInputProps {
    column: TableColumn;
    value: CellValue;
    onChange: (value: CellValue) => void;
    className?: string;
}

/** Renders a user-defined column cell based on its configuration (type + value mode). */
const CustomCellInput = memo(({ column, value, onChange, className = '' }: CustomCellInputProps) => {
    if (!column.editable) {
        return (
            <span className={`block text-center font-medium text-gray-700 dark:text-gray-300 ${className}`} title={`${column.name} is generated automatically`}>
                {formatCellValue(value)}
            </span>
        );
    }

    const isNumber = column.type === 'number';
    return (
        <input
            type={isNumber ? 'number' : 'text'}
            value={formatCellValue(value)}
            onChange={(e) => {
                const raw = e.target.value;
                if (!isNumber) return onChange(raw);
                const num = Number(raw);
                onChange(raw === '' || !Number.isFinite(num) ? null : num);
            }}
            className={`w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${className}`}
            placeholder={column.name}
            aria-label={column.name}
        />
    );
});

CustomCellInput.displayName = 'CustomCellInput';

export default CustomCellInput;

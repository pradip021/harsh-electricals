import React, { useState, FC } from 'react';

interface CustomUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

const CustomUnitModal: FC<CustomUnitModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
            setName('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn border border-gray-100 dark:border-gray-700">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight uppercase">Custom Unit</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                            Define a new measurement unit for your electrical work items.
                        </p>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 pl-1">Unit Name</label>
                            <input
                                autoFocus
                                type="text"
                                value={name}
                                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Rolls, Bags..."
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-800 dark:text-white"
                            />
                        </div>

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
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-700 active:scale-95 transition-all"
                            >
                                Save Unit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomUnitModal;

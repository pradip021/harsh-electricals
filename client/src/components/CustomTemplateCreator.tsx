import { useState } from 'react';
import { saveCustomTemplate } from '../utils/templates';
import Modal from './Modal';
import { QuotationItem } from '../types';

interface CustomTemplateCreatorProps {
    onSave: (template: any) => void;
    onCancel: () => void;
    currentItems: QuotationItem[];
}

const CustomTemplateCreator = ({ onSave, onCancel, currentItems }: CustomTemplateCreatorProps) => {
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'success' | 'error' | 'warning';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    const handleSave = () => {
        if (!templateName.trim()) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please enter a template name'
            });
            return;
        }

        if (!currentItems || currentItems.length === 0) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please add at least one item to save as template'
            });
            return;
        }

        const hasValidItems = currentItems.some(item => item.pointName.trim() !== '');
        if (!hasValidItems) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please add at least one item with a point name'
            });
            return;
        }

        try {
            const template = {
                name: templateName.trim(),
                description: templateDescription.trim() || 'Custom electrical work template',
                items: currentItems.map(item => ({
                    pointName: item.pointName,
                    description: item.description || '',
                    qty: item.qty,
                    unit: item.unit || 'Nos',
                    isSection: !!item.isSection,
                    rate: 0,
                })),
            };

            const savedTemplate = saveCustomTemplate(template);

            setModal({
                isOpen: true,
                type: 'success',
                title: 'Template Saved!',
                message: `Your custom template "${templateName}" has been saved successfully`
            });

            setTimeout(() => {
                onSave(savedTemplate);
            }, 1500);
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Save Failed',
                message: 'Unable to save template. Please try again.'
            });
        }
    };

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-[1rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[95vh] overflow-hidden animate-scaleIn border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                    <svg className="w-48 h-48 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" /></svg>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10">
                    <div className="relative z-10 mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                                Save <span className="text-red-600">Template</span>
                            </h2>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-300 active:scale-90"
                            >
                                <svg className="w-5 h-5 text-gray-400 dark:text-gray-200" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-relaxed max-w-md">Save this configuration for future projects.</p>
                    </div>

                    <div className="relative z-10 space-y-6 mb-8">
                        <div className="group">
                            <label htmlFor="templateName" className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2 ml-1 transition-colors group-focus-within:text-red-600">
                                Template Identifier
                            </label>
                            <input
                                type="text"
                                id="templateName"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-red-600/20 focus:ring-4 focus:ring-red-600/5 transition-all font-bold text-lg text-gray-800 dark:text-gray-100 placeholder-gray-300"
                                placeholder="e.g., Standard 2BHK Layout"
                                autoFocus
                            />
                        </div>

                        <div className="group">
                            <label htmlFor="templateDescription" className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2 ml-1 transition-colors group-focus-within:text-red-600">
                                Scope Description
                            </label>
                            <textarea
                                id="templateDescription"
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-red-600/20 focus:ring-4 focus:ring-red-600/5 transition-all font-medium text-gray-600 dark:text-gray-400 placeholder-gray-300 resize-none"
                                placeholder="Purpose of this template..."
                                rows={2}
                            />
                        </div>

                        <div className="bg-gray-50 dark:bg-black rounded-3xl p-6 border border-gray-100 dark:border-gray-800 relative overflow-hidden bg-grid">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-10 h-10 text-gray-400 dark:text-white" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>

                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-4 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 animate-pulse"></span>
                                Work Stream Components ({currentItems?.filter(i => i.pointName.trim()).length || 0})
                            </h3>

                            <div className="max-h-40 overflow-y-auto custom-scrollbar dark:custom-scrollbar-dark space-y-2 pr-1">
                                {currentItems?.filter(i => i.pointName.trim()).map((item, index) => (
                                    <div key={index} className="group/item text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center bg-white dark:bg-gray-800/50 p-3 px-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-red-600/30 transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <span className="w-6 text-gray-300 dark:text-gray-600 font-black group-hover/item:text-red-600 transition-colors">{(index + 1).toString().padStart(2, '0')}</span>
                                        <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{item.pointName}</span>
                                        <span className="text-[9px] font-black bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-md text-gray-400 dark:text-gray-500 uppercase tracking-widest border border-gray-100 dark:border-gray-700 group-hover/item:text-red-600 group-hover/item:border-red-600/30 transition-all">{item.unit || 'Nos'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 p-8 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col sm:flex-row gap-4 justify-end items-center">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 text-gray-400 dark:text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-center"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center space-x-3 group"
                    >
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Finalize Template</span>
                    </button>
                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default CustomTemplateCreator;

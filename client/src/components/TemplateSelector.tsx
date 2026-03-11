import { useState } from 'react';
import { getAllTemplates, deleteCustomTemplate } from '../utils/templates';

interface TemplateSelectorProps {
    onSelect: (template: any) => void;
    onClose: () => void;
}

const TemplateSelector = ({ onSelect, onClose }: TemplateSelectorProps) => {
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [templates, setTemplates] = useState(getAllTemplates());

    const handleSelect = () => {
        if (selectedTemplate) {
            onSelect(selectedTemplate);
            onClose();
        }
    };

    const handleDelete = (templateId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this custom template?')) {
            deleteCustomTemplate(templateId);
            setTemplates(getAllTemplates());
            if (selectedTemplate?.id === templateId) {
                setSelectedTemplate(null);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-[1rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] max-w-6xl w-full max-h-[92vh] overflow-hidden animate-scaleIn border border-gray-100 dark:border-gray-700 flex flex-col backdrop-blur-3xl">
                <div className="shrink-0 p-6 md:p-8 relative overflow-hidden bg-white dark:bg-gray-800">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <svg className="w-48 h-48 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tighter mb-1">
                                Choose Your <span className="text-red-600">Template</span>
                            </h2>
                            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium max-w-2xl">Standardize your workflow with pre-configured electrical setups.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="group w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-300 active:scale-90"
                        >
                            <svg className="w-5 h-5 text-gray-400 dark:text-gray-200 group-hover:rotate-90 transition-transform duration-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-0 bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {templates.map((template, idx) => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => setSelectedTemplate(template)}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                                className={`group relative text-left p-6 rounded-3xl border-2 transition-all duration-500 hover-lift animate-fadeIn ${selectedTemplate?.id === template.id
                                    ? 'border-red-600 bg-white dark:bg-gray-800 shadow-xl ring-4 ring-red-50 dark:ring-red-900/10'
                                    : 'border-transparent bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl'
                                    }`}
                            >
                                {template.isCustom && (
                                    <div className="absolute top-6 right-6 flex items-center gap-1.5">
                                        <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
                                            Custom
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(template.id, e)}
                                            className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all active:scale-75"
                                        >
                                            <svg className="w-4 h-4" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${selectedTemplate?.id === template.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                        <svg className="w-6 h-6" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    {selectedTemplate?.id === template.id && (
                                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-scaleIn shadow-lg shadow-red-600/40">
                                            <svg className="w-5 h-5 text-white" fill="none" strokeWidth="4" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-xl font-black transition-colors duration-300 mb-1.5 ${selectedTemplate?.id === template.id ? 'text-red-600' : 'text-gray-800 dark:text-gray-100'}`}>
                                    {template.name}
                                </h3>

                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium line-clamp-2 leading-relaxed h-10">
                                    {template.description}
                                </p>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                        <svg className="w-4 h-4 mr-2 opacity-60" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        {template.items.length} Work Items
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedTemplate?.id === template.id ? 'bg-red-600 animate-pulse' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 p-6 md:p-8 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col-reverse sm:flex-row gap-4 justify-end items-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Maybe Later
                    </button>
                    <button
                        type="button"
                        onClick={handleSelect}
                        disabled={!selectedTemplate}
                        className={`w-full sm:w-64 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-3 border-none group ${selectedTemplate
                            ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/30 active:scale-95'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                            }`}
                    >
                        <span>Start Workspace</span>
                        <svg className={`w-5 h-5 transition-transform duration-300 ${selectedTemplate ? 'group-hover:translate-x-1.5' : ''}`} fill="none" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateSelector;

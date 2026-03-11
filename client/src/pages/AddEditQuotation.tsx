import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuotations } from '../context/QuotationContext';
import { useQuotationReducer } from '../hooks/useQuotationReducer';
import QuotationTable from '../components/QuotationTable';
import Modal from '../components/Modal';
import TemplateSelector from '../components/TemplateSelector';
import CustomTemplateCreator from '../components/CustomTemplateCreator';

const AddEditQuotation = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addQuotation, updateQuotation, getQuotationById } = useQuotations();
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'success' | 'error' | 'warning';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [showCustomTemplateCreator, setShowCustomTemplateCreator] = useState(false);
    const [templateSelected, setTemplateSelected] = useState(false);
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const {
        state,
        totalAmount,
        subtotal,
        gstAmount,
        setClientName,
        setDate,
        setRef,
        setAddress,
        setSubject,
        setMessage,
        setNotes,
        addItem,
        removeItem,
        updateItem,
        setSignature,
        loadQuotation,
        loadTemplate,
        addSection,
        toggleGST,
        setGSTRate
    } = useQuotationReducer();

    const handleAddSection = () => {
        addSection();
    };

    const isEditMode = Boolean(id);

    // Show template selector on mount for new quotations
    useEffect(() => {
        if (!isEditMode && !templateSelected) {
            setShowTemplateSelector(true);
        }
    }, [isEditMode, templateSelected]);

    // Load quotation data if in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const quotation = getQuotationById(id);
            if (quotation) {
                loadQuotation(quotation);
                setTemplateSelected(true);
            } else {
                // If not in local list, wait for fetch or handled by context
            }
        }
    }, [id, isEditMode, getQuotationById, loadQuotation]);

    const handleTemplateSelect = (template: any) => {
        loadTemplate(template);
        setTemplateSelected(true);
        setShowTemplateSelector(false);
    };

    const handleCreateCustomTemplate = () => {
        setShowCustomTemplateCreator(true);
    };

    const handleSaveCustomTemplate = (savedTemplate: any) => {
        setShowCustomTemplateCreator(false);
        setModal({
            isOpen: true,
            type: 'success',
            title: 'Template Saved!',
            message: `Your custom template "${savedTemplate.name}" has been saved and can be reused for future quotations`
        });
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event: any) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    if (r > 200 && g > 200 && b > 200) {
                        data[i + 3] = 0;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                setSignature(canvas.toDataURL());
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!state.clientName.trim()) {
            setShowValidationErrors(true);
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please enter client name'
            });
            return;
        }

        if (!state.date) {
            setShowValidationErrors(true);
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please select a date'
            });
            return;
        }

        if (state.items.length === 0) {
            setShowValidationErrors(true);
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please add at least one item'
            });
            return;
        }

        const hasInvalidItems = state.items.some(
            (item: any) => {
                const isSection = item.isSection;
                const pointEmpty = !item.pointName?.trim();
                if (isSection) return pointEmpty;
                const qtyVal = String(item.qty).trim();
                const rateVal = parseFloat(item.rate) || 0;
                return pointEmpty || !qtyVal || rateVal <= 0;
            }
        );

        if (hasInvalidItems) {
            setShowValidationErrors(true);
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please fill all item details (Point Name, Qty, and Rate must be valid)'
            });
            return;
        }

        setShowValidationErrors(false);
        setSubmitting(true);

        const quotationData = {
            ...state,
            totalAmount,
        };

        try {
            if (isEditMode && id) {
                await updateQuotation(id, quotationData);
                setModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Updated Successfully!',
                    message: 'Your quotation has been updated in the cloud'
                });
            } else {
                await addQuotation(quotationData);
                setModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Created Successfully!',
                    message: 'Your new quotation has been saved to the cloud'
                });
            }
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err: any) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Operation Failed',
                message: err.message || 'Something went wrong while saving'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 transition-colors duration-300">
            {!showTemplateSelector ? (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 animate-fadeIn flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                {isEditMode ? 'Edit Project' : 'New Project'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                                {isEditMode ? 'Update your professional quotation details' : 'Draft a new professional electrical quotation'}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            {!isEditMode && templateSelected && (
                                <button
                                    type="button"
                                    onClick={() => setShowTemplateSelector(true)}
                                    className="px-6 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-600/20 rounded-2xl font-bold hover:bg-purple-50 transition-all flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    <span>Change Template</span>
                                </button>
                            )}
                            {state.items.some((item: any) => item.pointName.trim()) && (
                                <button
                                    type="button"
                                    onClick={handleCreateCustomTemplate}
                                    className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-600/30 hover:scale-105 transition-all flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    <span>Save as Template</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8">
                        {/* Electrical Work Details Block */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-red-600 rounded-full mr-3"></span>
                                Client & Quotation Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Client Full Name *</label>
                                    <input
                                        type="text"
                                        value={state.clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold"
                                        placeholder="Enter client names"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Quotation Date *</label>
                                    <input
                                        type="date"
                                        value={state.date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Quotation Reference</label>
                                    <input
                                        type="text"
                                        value={state.ref}
                                        onChange={(e) => setRef(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold"
                                        placeholder="e.g. HEW/2026/042"
                                    />
                                </div>
                                <div className="space-y-2 lg:col-span-3">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Subject Line</label>
                                    <input
                                        type="text"
                                        value={state.subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold"
                                        placeholder="Sub : Electrical Quotation for..."
                                    />
                                </div>
                                <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Site Address</label>
                                        <textarea
                                            value={state.clientAddress}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold min-h-[100px]"
                                            placeholder="Full address of the electrical site..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Greeting Message</label>
                                        <textarea
                                            value={state.message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold min-h-[100px]"
                                            placeholder="Dear Sir/Madam, ..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scope of Work Block */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                                Scope of Work & Items
                            </h2>
                            <QuotationTable
                                items={state.items}
                                onUpdateItem={updateItem}
                                onRemoveItem={removeItem}
                                onAddItem={addItem}
                                onAddSection={handleAddSection}
                                showValidationErrors={showValidationErrors}
                            />
                        </div>

                        {/* Taxation & Summary Block */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Taxation & Settings</h2>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-6 border border-gray-100 dark:border-gray-700">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Enable GST</span>
                                    <button
                                        type="button"
                                        onClick={() => toggleGST()}
                                        className={`w-14 h-8 rounded-full transition-all relative ${state.gstEnabled ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${state.gstEnabled ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {state.gstEnabled && (
                                    <div className="grid grid-cols-4 gap-3 animate-fadeIn">
                                        {[5, 12, 18, 28].map(r => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setGSTRate(r)}
                                                className={`py-3 rounded-xl text-sm font-black transition-all ${state.gstRate === r ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-300' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {r}%
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between">
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-400 font-bold uppercase text-xs tracking-widest">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {state.gstEnabled && (
                                        <div className="flex justify-between text-red-500 font-bold uppercase text-xs tracking-widest animate-fadeIn">
                                            <span>GST ({state.gstRate}%)</span>
                                            <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="h-[1px] bg-white/10 my-4"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black uppercase tracking-[0.2em]">Grand Total</span>
                                        <span className="text-4xl font-black text-red-500">₹{totalAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 text-lg"
                                    >
                                        {submitting ? (
                                            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" /></svg>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                <span>{isEditMode ? 'Update Quotation' : 'Publish Quotation'}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/80 font-bold rounded-xl transition-all"
                                    >
                                        Discard Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <TemplateSelector
                    onSelect={handleTemplateSelect}
                    onClose={() => setShowTemplateSelector(false)}
                />
            )}

            {showCustomTemplateCreator && (
                <CustomTemplateCreator
                    currentItems={state.items}
                    onSave={handleSaveCustomTemplate}
                    onCancel={() => setShowCustomTemplateCreator(false)}
                />
            )}

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default AddEditQuotation;

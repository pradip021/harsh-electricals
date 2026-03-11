import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuotations } from '../context/QuotationContext';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import { useState } from 'react';
import Modal from '../components/Modal';

const ViewQuotation = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getQuotationById, deleteQuotation } = useQuotations();
    const [loadingPDF, setLoadingPDF] = useState(false);
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'success' | 'error' | 'warning';
        title: string;
        message: string;
        onConfirm?: (() => void) | null;
    }>({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null });

    const quotation = id ? getQuotationById(id) : null;

    if (!quotation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center page-transition">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-12 text-center max-w-md border border-gray-100 dark:border-gray-700">
                    <svg
                        className="w-20 h-20 text-red-300 mx-auto mb-6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Quotation Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">The quotation you're looking for doesn't exist.</p>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const handleDownloadPDF = async () => {
        setLoadingPDF(true);
        try {
            await generateQuotationPDF(quotation);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'PDF Downloaded!',
                message: 'Your quotation PDF has been downloaded successfully'
            });
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Download Failed',
                message: 'Unable to generate PDF. Please try again.'
            });
        } finally {
            setLoadingPDF(false);
        }
    };

    const handleDelete = () => {
        setModal({
            isOpen: true,
            type: 'warning',
            title: 'Delete Quotation?',
            message: `This will permanently delete the quotation for "${quotation.clientName}". This action cannot be undone.`,
            onConfirm: () => {
                if (id) {
                    deleteQuotation(id);
                    setModal(prev => ({ ...prev, isOpen: false }));
                    navigate('/dashboard');
                }
            }
        });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 transition-colors duration-300 page-transition">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 animate-fadeIn">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Quotation Details</h1>
                            <p className="text-gray-600 dark:text-gray-400">Complete quotation information and breakdown</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105 shadow-md flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back</span>
                            </button>
                            <Link
                                to={`/edit/${id}`}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 shadow-md flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit</span>
                            </Link>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={loadingPDF}
                                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 shadow-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingPDF ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Download PDF</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 shadow-md flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700 animate-fadeIn animation-delay-200">
                    <div className="border-b-4 border-red-600 pb-4 mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
                            HARSH ELECTRICALS WORKS
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">Professional Electrical Solutions & Contractor</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-700/30 p-4 rounded-lg border-l-4 border-red-600">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Client Name</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{quotation.clientName}</p>
                            {quotation.clientAddress && (
                                <div className="mt-2 pt-2 border-t border-red-100 dark:border-red-900/30">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 font-bold">Client Address</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">{quotation.clientAddress}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-700/30 p-4 rounded-lg border-l-4 border-blue-600">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Date</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                {new Date(quotation.date).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {quotation.ref && (
                            <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-700/30 p-4 rounded-lg border-l-4 border-green-600">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Reference ID</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{quotation.ref}</p>
                            </div>
                        )}
                    </div>

                    {(quotation.subject || quotation.message) && (
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            {quotation.subject && (
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Subject</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100 underline decoration-red-600/30 underline-offset-4">{quotation.subject}</p>
                                </div>
                            )}
                            {quotation.message && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Message Body</p>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">{quotation.message}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-fadeIn animation-delay-400">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Point Breakdown & Costing
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                                    <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] border-r border-red-700/30">Sr.</th>
                                    <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] border-r border-red-700/30">Description</th>
                                    <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px] border-r border-red-700/30">Qty (Unit)</th>
                                    <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[10px] border-r border-red-700/30">Rate (₹)</th>
                                    <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[10px]">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-left">
                                {quotation.items.map((item, index) => {
                                    if (item.isSection) {
                                        return (
                                            <tr key={item.id} className="bg-gray-100 dark:bg-gray-800/80">
                                                <td colSpan={5} className="px-6 py-3 text-sm font-black text-red-600 dark:text-red-500 uppercase tracking-widest border-y border-gray-200 dark:border-gray-700 text-center">
                                                    — {item.pointName} —
                                                </td>
                                            </tr>
                                        );
                                    }
                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700/50 group-hover:text-red-600 transition-colors duration-200">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700/50 font-medium">
                                                {item.pointName}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700/50 font-bold">
                                                {(!item.qty || item.qty === '0' || item.qty === 0)
                                                    ? 'L.S.'
                                                    : (item.unit && item.unit !== 'Nos' && item.unit !== 'Text')
                                                        ? `${item.qty} ${item.unit}`
                                                        : item.qty
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700/50 font-bold tabular-nums">
                                                {Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white tabular-nums">
                                                ₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="border-t-2 border-red-600">
                                {quotation.gstEnabled && (
                                    <>
                                        <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                                            <td colSpan={4} className="px-6 py-3 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                Subtotal:
                                            </td>
                                            <td className="px-6 py-3 text-right text-base font-black text-gray-700 dark:text-gray-200 tabular-nums">
                                                ₹{(Number(quotation.totalAmount) - (Number((quotation as any).gstAmount) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
                                            <td colSpan={4} className="px-6 py-3 text-right text-[10px] font-black text-red-500/80 uppercase tracking-widest">
                                                GST ({quotation.gstRate}%):
                                            </td>
                                            <td className="px-6 py-3 text-right text-base font-black text-red-600/80 tabular-nums">
                                                + ₹{(Number((quotation as any).gstAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </>
                                )}
                                <tr className="bg-red-50/30 dark:bg-red-900/20">
                                    <td colSpan={4} className="px-6 py-6 text-right text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-[0.2em]">
                                        {quotation.gstEnabled ? 'Grand Total Payable:' : 'Total Amount Payable:'}
                                    </td>
                                    <td className="px-6 py-6 text-right text-3xl font-black text-red-600 tabular-nums">
                                        ₹{Number(quotation.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {quotation.notes && (
                        <div className="p-8 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
                                Terms & Conditions
                            </h4>
                            <p className="text-gray-700 dark:text-gray-400 whitespace-pre-wrap font-medium leading-relaxed italic">{quotation.notes}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-8 animate-fadeIn animation-delay-600">
                    <div className="text-center md:text-left">
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Authorization</p>
                        <p className="text-lg font-black text-gray-800 dark:text-gray-100">Harsh Electricals Works</p>
                        <p className="text-xs text-gray-500 dark:text-gray-600 font-bold mt-1">Proprietor Signature / Seal</p>
                    </div>
                    {quotation.signature && (
                        <div className="relative group p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <img src={quotation.signature} alt="Signature" className="max-h-24 object-contain transition-transform group-hover:scale-110" />
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm || undefined}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default ViewQuotation;

import { Link } from 'react-router-dom';
import { useQuotations } from '../context/QuotationContext';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import { useState, useMemo, useEffect } from 'react';
import Modal from '../components/Modal';
import { Quotation } from '../types';

const Dashboard = () => {
    const { quotations, deleteQuotation, loading, error, fetchQuotations } = useQuotations();
    const [loadingPDF, setLoadingPDF] = useState<string | null>(null);
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'success' | 'error' | 'warning';
        title: string;
        message: string;
        onConfirm?: (() => void) | null;
    }>({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null });

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    // Calculate statistics
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonth = quotations.filter(q => {
            const qDate = new Date(q.date);
            return qDate.getMonth() === currentMonth && qDate.getFullYear() === currentYear;
        });

        const lastMonth = quotations.filter(q => {
            const qDate = new Date(q.date);
            const lastMonthDate = new Date(currentYear, currentMonth - 1);
            return qDate.getMonth() === lastMonthDate.getMonth() && qDate.getFullYear() === lastMonthDate.getFullYear();
        });

        const totalRevenue = quotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
        const thisMonthRevenue = thisMonth.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
        const avgQuotationValue = quotations.length > 0 ? totalRevenue / quotations.length : 0;

        const lastMonthRevenue = lastMonth.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
        const revenueGrowth = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        return {
            total: quotations.length,
            thisMonth: thisMonth.length,
            totalRevenue,
            thisMonthRevenue,
            avgQuotationValue,
            revenueGrowth,
        };
    }, [quotations]);

    // Get recent activity
    const recentActivity = useMemo(() => {
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthQuotations = quotations.filter(q => {
                const qDate = new Date(q.date);
                return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
            });

            months.push({
                month: date.toLocaleDateString('en-IN', { month: 'short' }),
                count: monthQuotations.length,
                revenue: monthQuotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0),
            });
        }

        return months;
    }, [quotations]);

    const maxCount = Math.max(...recentActivity.map(m => m.count), 1);

    // Filter and sort
    const filteredAndSortedQuotations = useMemo(() => {
        let filtered = quotations.filter(q =>
            q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.totalAmount.toString().includes(searchQuery)
        );

        switch (sortBy) {
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                break;
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                break;
            case 'amount-desc':
                filtered.sort((a, b) => (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0));
                break;
            case 'amount-asc':
                filtered.sort((a, b) => (Number(a.totalAmount) || 0) - (Number(b.totalAmount) || 0));
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.clientName.localeCompare(b.clientName));
                break;
        }

        return filtered;
    }, [quotations, searchQuery, sortBy]);

    const handleDownloadPDF = async (quotation: Quotation) => {
        const id = quotation._id || quotation.id;
        if (!id) return;

        setLoadingPDF(id);
        try {
            await generateQuotationPDF(quotation);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Success!',
                message: 'Your quotation PDF has been downloaded successfully',
                onConfirm: null
            });
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Download Failed',
                message: 'Unable to generate PDF. Please try again.',
                onConfirm: null
            });
        } finally {
            setLoadingPDF(null);
        }
    };

    const handleDelete = (id: string, clientName: string) => {
        setModal({
            isOpen: true,
            type: 'warning',
            title: 'Delete Quotation?',
            message: `This will permanently delete the quotation for "${clientName}". This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await deleteQuotation(id);
                    setModal({
                        isOpen: true,
                        type: 'success',
                        title: 'Deleted!',
                        message: 'Quotation has been removed successfully',
                        onConfirm: null
                    });
                } catch (err: any) {
                    setModal({
                        isOpen: true,
                        type: 'error',
                        title: 'Delete Failed',
                        message: err.message,
                        onConfirm: null
                    });
                }
            }
        });
    };

    if (loading && quotations.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 font-bold animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center justify-between">
                        <span className="font-bold">{error}</span>
                        <button onClick={() => fetchQuotations()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Retry</button>
                    </div>
                )}

                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="animate-slideInLeft text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Manage your quotations and financial statistics</p>
                    </div>
                    <Link
                        to="/add"
                        className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-black shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3 group animate-slideInRight"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-lg">New Quotation</span>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Quotations', value: stats.total, color: 'red', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        { label: 'Total Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(1)}K`, color: 'green', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'This Month', value: stats.thisMonth, color: 'blue', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { label: 'Avg Value', value: `₹${(stats.avgQuotationValue / 1000).toFixed(1)}K`, color: 'purple', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                    ].map((item, i) => (
                        <div key={i} className={`bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 animate-fadeIn`} style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-14 h-14 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-2xl flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 shadow-inner`}>
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                                </div>
                                <div className={`px-3 py-1 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 rounded-lg text-xs font-black uppercase tracking-widest`}>Live</div>
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">{item.label}</h3>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters & Content */}
                <div className="mb-8 flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-2/3 space-y-6">
                        {/* Filter Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full mr-3"></div>
                                Recent Quotations
                            </h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by client or quotation ref..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="md:w-64 relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full pl-4 pr-10 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="date-desc">Newest Quotations</option>
                                        <option value="date-asc">Oldest Quotations</option>
                                        <option value="amount-desc">Highest Budget</option>
                                        <option value="amount-asc">Lowest Budget</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-4">
                                <p className="text-gray-500">Showing <span className="font-bold text-gray-900 dark:text-gray-100">{filteredAndSortedQuotations.length}</span> results</p>
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="text-red-600 font-bold hover:underline">Clear Search</button>
                                )}
                            </div>
                        </div>

                        {/* List Section */}
                        {filteredAndSortedQuotations.length === 0 ? (
                            <div className="py-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl text-center animate-pulse">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Quotations Found</h3>
                                <p className="text-gray-500 max-w-xs mx-auto mb-6">Start by creating your first quotation or try a different search term.</p>
                                <Link to="/add" className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors inline-block">Create Now</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAndSortedQuotations.map((q, i) => (
                                    <div key={q._id || q.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl transition-all hover:border-red-500/50 hover:shadow-2xl hover:scale-[1.01] animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-red-600 font-black text-xl shadow-sm">
                                                    {q.clientName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{q.clientName}</h3>
                                                    <div className="flex items-center space-x-3 mt-1">
                                                        <span className="text-sm font-bold text-gray-500 flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            {new Date(q.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px]">REF: {q.ref || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-red-600 mb-2">₹{(Number(q.totalAmount) || 0).toLocaleString('en-IN')}</p>
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Link to={`/view/${q._id || q.id}`} className="p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></Link>
                                                    <Link to={`/edit/${q._id || q.id}`} className="p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></Link>
                                                    <button onClick={() => handleDownloadPDF(q)} disabled={loadingPDF === (q._id || q.id)} className="p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-all shadow-sm disabled:opacity-50">
                                                        {loadingPDF === (q._id || q.id)
                                                            ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" /></svg>
                                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        }
                                                    </button>
                                                    <button onClick={() => handleDelete(q._id || q.id!, q.clientName)} className="p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center">
                                <span className="w-1.5 h-6 bg-red-600 rounded-full mr-3"></span>
                                Growth Analysis
                            </h3>
                            <div className="space-y-6">
                                {recentActivity.map((month, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-bold text-gray-500 uppercase">{month.month}</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">₹{(month.revenue / 1000).toFixed(1)}K</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000 group-hover:from-red-600 group-hover:to-red-700"
                                                style={{ width: `${(month.count / maxCount) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-2">Need Help?</h3>
                                <p className="text-red-100 font-medium mb-6">Explore our tutorials or contact support for advanced features.</p>
                                <button className="w-full py-4 bg-white text-red-600 font-black rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all">Get Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm!}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default Dashboard;

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const isErrorField = (field: string) => {
        const lowerError = error.toLowerCase();
        if (field === 'email' && lowerError.includes('email')) return true;
        if (field === 'password' && lowerError.includes('password')) return true;
        if (lowerError.includes('credentials')) return true; // Highlight both for generic "Invalid credentials"
        return false;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="max-w-xl w-full animate-fadeIn">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] p-12 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl mb-6 shadow-inner">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Login to manage your quotations</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-5 rounded-2xl mb-8 text-sm font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-shake">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 transition-colors ${isErrorField('email') ? 'text-red-600' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-red-600'}`}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-5 py-4 rounded-2xl border-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none font-medium ${isErrorField('email') ? 'border-red-100 focus:border-red-600 text-red-600' : 'border-transparent focus:border-red-600/20 focus:bg-white dark:focus:bg-gray-800'}`}
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="group relative">
                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 transition-colors ${isErrorField('password') ? 'text-red-600' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-red-600'}`}>Security Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-5 py-4 rounded-2xl border-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none font-medium pr-14 ${isErrorField('password') ? 'border-red-100 focus:border-red-600 text-red-600' : 'border-transparent focus:border-red-600/20 focus:bg-white dark:focus:bg-gray-800'}`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-70 disabled:hover:scale-100 overflow-hidden relative group"
                        >
                            <span className="relative z-10">{loading ? 'Verifying...' : 'Access Dashboard'}</span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </form>

                    <div className="mt-10 text-center pt-8 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-red-600 hover:text-red-700 font-bold decoration-2 hover:underline underline-offset-4 ml-1">
                                Create Brand Profile
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

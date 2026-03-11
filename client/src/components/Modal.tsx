import { useEffect, FC } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: 'confirm' | 'success' | 'error' | 'warning';
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full border-4 border-green-100 bg-green-50 animate-scaleIn">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full border-4 border-red-100 bg-red-50 animate-scaleIn">
                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full border-4 border-yellow-100 bg-yellow-50 animate-scaleIn">
                        <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full border-4 border-blue-100 bg-blue-50 animate-scaleIn">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-white dark:bg-gray-800',
                    border: 'border-gray-100 dark:border-gray-700',
                    button: 'bg-green-600 hover:bg-green-700',
                };
            case 'error':
                return {
                    bg: 'bg-white dark:bg-gray-800',
                    border: 'border-gray-100 dark:border-gray-700',
                    button: 'bg-red-600 hover:bg-red-700',
                };
            case 'warning':
                return {
                    bg: 'bg-white dark:bg-gray-800',
                    border: 'border-gray-100 dark:border-gray-700',
                    button: 'bg-red-600 hover:bg-red-700',
                };
            default:
                return {
                    bg: 'bg-white dark:bg-gray-800',
                    border: 'border-gray-100 dark:border-gray-700',
                    button: 'bg-red-600 hover:bg-red-700',
                };
        }
    };

    const colors = getColors();

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            <div className={`relative ${colors.bg} rounded-3xl shadow-2xl max-w-[520px] w-full p-10 animate-scaleIn border ${colors.border}`}>
                <div className="text-center">
                    {getIcon()}

                    <h3 className="text-4xl font-black text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                        {title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg font-medium leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-4 justify-center">
                        {type === 'confirm' || type === 'warning' ? (
                            <>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`px-8 py-3 ${colors.button} text-white rounded-xl font-bold font-black shadow-lg transition-all duration-200 active:scale-95`}
                                >
                                    Confirm Action
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className={`px-12 py-3.5 ${colors.button} text-white rounded-xl font-black text-sm tracking-widest shadow-lg transition-all duration-200 active:scale-95`}
                            >
                                OK, Got it
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;

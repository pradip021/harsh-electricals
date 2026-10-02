import { useRef, useState } from 'react';
import { SignatureMode } from '../types';
import { usePrintableSignature } from '../hooks/usePrintableSignature';
import { prepareSignatureFile, SIGNATURE_ACCEPT } from '../utils/signature';

interface SignatureSettingsProps {
    mode: SignatureMode;
    signature: string;
    onModeChange: (mode: SignatureMode) => void;
    onSignatureChange: (signature: string) => void;
    showValidationErrors?: boolean;
}

const MODE_OPTIONS: { value: SignatureMode; title: string; description: string }[] = [
    { value: 'DIGITAL', title: 'Digital Signature', description: 'Print your uploaded signature image on the PDF.' },
    { value: 'PHYSICAL', title: 'Physical Signature', description: 'Leave a blank line to sign by hand after printing.' },
];

const secondaryButton = 'px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-sm hover:border-red-600 hover:text-red-600 transition-all disabled:opacity-50';
const primaryButton = 'px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition-all disabled:opacity-50';

const SignatureSettings = ({ mode, signature, onModeChange, onSignatureChange, showValidationErrors }: SignatureSettingsProps) => {
    const fileInput = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);
    const [uploadError, setUploadError] = useState('');
    // Status of the stored image regardless of the selected mode.
    const stored = usePrintableSignature(signature, 'DIGITAL');

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setProcessing(true);
        setUploadError('');
        try {
            onSignatureChange(await prepareSignatureFile(file));
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Unable to read this image.');
        } finally {
            setProcessing(false);
        }
    };

    const openFilePicker = () => fileInput.current?.click();
    const uploadLabel = processing ? 'Processing…' : 'Upload Signature';
    const missingDigital = mode === 'DIGITAL' && stored.status === 'missing';

    return (
        <div className="space-y-6">
            <div>
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Signature Type</label>
                <div role="radiogroup" aria-label="Signature type" className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MODE_OPTIONS.map((option) => {
                        const selected = mode === option.value;
                        return (
                            <label
                                key={option.value}
                                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selected ? 'border-red-600 bg-red-50/60 dark:bg-red-900/20' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-500'}`}
                            >
                                <input
                                    type="radio"
                                    name="signatureMode"
                                    value={option.value}
                                    checked={selected}
                                    onChange={() => onModeChange(option.value)}
                                    className="mt-1 w-4 h-4 accent-red-600"
                                />
                                <span>
                                    <span className="block font-black text-gray-900 dark:text-white">{option.title}</span>
                                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">{option.description}</span>
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {mode === 'DIGITAL' ? (
                <div className="space-y-3">
                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Digital Signature</label>

                    {stored.status === 'ready' && stored.src && (
                        <>
                            <div className="flex items-center justify-center h-36 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white">
                                <img src={stored.src} alt="Uploaded signature" className="max-h-28 max-w-[80%] object-contain" />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button type="button" onClick={openFilePicker} disabled={processing} className={secondaryButton}>
                                    {processing ? 'Processing…' : 'Replace Signature'}
                                </button>
                                <button type="button" onClick={() => onSignatureChange('')} disabled={processing} className={secondaryButton}>
                                    Remove Signature
                                </button>
                            </div>
                        </>
                    )}

                    {stored.status === 'checking' && (
                        <div className="flex items-center justify-center h-36 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-400">
                            Loading signature…
                        </div>
                    )}

                    {(stored.status === 'missing' || stored.status === 'invalid') && (
                        <div className={`flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border-2 border-dashed px-4 text-center ${missingDigital && showValidationErrors ? 'border-red-500 bg-red-50/60 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                {stored.status === 'missing'
                                    ? 'No digital signature uploaded.'
                                    : 'The saved signature image could not be loaded. Please upload it again.'}
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <button type="button" onClick={openFilePicker} disabled={processing} className={primaryButton}>
                                    {uploadLabel}
                                </button>
                                {stored.status === 'invalid' && (
                                    <button type="button" onClick={() => onSignatureChange('')} className={secondaryButton}>
                                        Remove Signature
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {missingDigital && showValidationErrors && (
                        <p className="text-sm font-bold text-red-600">Upload a signature or choose Physical Signature.</p>
                    )}
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        PNG with a transparent background works best. JPEG and WebP photos have their light background removed automatically. Max 5 MB.
                    </p>
                </div>
            ) : (
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="shrink-0 w-44 text-center text-xs text-gray-500 dark:text-gray-400" aria-hidden="true">
                        <div className="h-10"></div>
                        <div className="border-t border-gray-500 dark:border-gray-400"></div>
                        <p className="mt-1">(Proprietor)</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-gray-700 dark:text-gray-200">The PDF will contain a blank area for physical signing.</p>
                        {stored.status !== 'missing' && (
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Your digital signature is kept and will be used again if you switch back to Digital Signature.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {uploadError && <p role="alert" className="text-sm font-bold text-red-600">{uploadError}</p>}

            <input ref={fileInput} type="file" accept={SIGNATURE_ACCEPT} onChange={handleFile} className="hidden" />
        </div>
    );
};

export default SignatureSettings;

import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { layoutQuotationDocument, PAGE_HEIGHT, PAGE_WIDTH, QuotationDocumentData } from '../utils/quotationDocument';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import { usePrintableSignature } from '../hooks/usePrintableSignature';

/** Keeps pages readable on large screens without the preview taking over the viewport. */
const MAX_PAGE_DISPLAY_WIDTH = 720;

interface QuotationPreviewProps {
    data: QuotationDocumentData;
}

/** Read-only A4 rendering of the current draft, built from the same layout the PDF uses. */
const QuotationPreview = memo(({ data }: QuotationPreviewProps) => {
    const [visible, setVisible] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');
    const [availableWidth, setAvailableWidth] = useState(MAX_PAGE_DISPLAY_WIDTH);
    const bodyRef = useRef<HTMLDivElement>(null);

    // Typing stays responsive: layout runs on the deferred value, which catches up right after each keystroke.
    const deferredData = useDeferredValue(data);
    const signature = usePrintableSignature(data.signature, data.signatureMode);
    const pages = useMemo(
        () => (visible ? layoutQuotationDocument(deferredData, signature.src) : []),
        [deferredData, signature.src, visible]
    );

    useEffect(() => {
        const element = bodyRef.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
        observer.observe(element);
        return () => observer.disconnect();
    }, [visible]);

    const scale = Math.min(availableWidth, MAX_PAGE_DISPLAY_WIDTH) / PAGE_WIDTH;

    const handleDownload = async () => {
        setDownloading(true);
        setDownloadError('');
        try {
            await generateQuotationPDF(data);
        } catch {
            setDownloadError('Unable to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700" aria-label="Live PDF preview">
            <div className={`flex flex-wrap items-center justify-between gap-3 ${visible ? 'mb-6 border-b border-gray-100 dark:border-gray-700 pb-4' : ''}`}>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
                        <span className="w-1.5 h-6 bg-green-600 rounded-full mr-3"></span>
                        Live PDF Preview
                    </h2>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 ml-4">
                        {visible ? `A4 · ${pages.length} page${pages.length === 1 ? '' : 's'} · updates as you edit` : 'Hidden'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span>{downloading ? 'Generating…' : 'Download PDF'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        aria-expanded={visible}
                        className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-sm hover:border-red-600 hover:text-red-600 transition-all"
                    >
                        {visible ? 'Hide Preview' : 'Show Preview'}
                    </button>
                </div>
            </div>

            {downloadError && <p className="text-sm font-bold text-red-600 mb-4">{downloadError}</p>}

            {visible && (signature.status === 'missing' || signature.status === 'invalid') && (
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 mb-4">
                    {signature.status === 'missing'
                        ? 'No digital signature uploaded. The preview shows the blank signing line until you upload one.'
                        : 'The digital signature image could not be loaded. The preview shows the blank signing line instead.'}
                </p>
            )}

            {visible && (
                <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 sm:p-8">
                    <div ref={bodyRef} className="flex flex-col items-center gap-6">
                        {pages.map((pageHtml, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <div
                                    className="bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
                                    style={{ width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale }}
                                >
                                    <div
                                        inert
                                        style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                                        dangerouslySetInnerHTML={{ __html: pageHtml }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    Page {index + 1} of {pages.length}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
});

QuotationPreview.displayName = 'QuotationPreview';

export default QuotationPreview;

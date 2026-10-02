import bundledSignature from '../assets/image.png';
import { SignatureMode } from '../types';

/** The proprietor signature shipped with the app; new quotations start with it in DIGITAL mode. */
export const DEFAULT_SIGNATURE = bundledSignature;

/** Same limit as the server. */
const MAX_SIGNATURE_BYTES = 512 * 1024;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const SIGNATURE_ACCEPT = ACCEPTED_TYPES.join(',');

/** Uploads are scaled to fit this box; the PDF prints signatures at most 150×60 px. */
const MAX_WIDTH = 600;
const MAX_HEIGHT = 240;
/** Pixels lighter than this become transparent when an upload has no transparency of its own. */
const BACKGROUND_LUMINANCE = 175;

const DATA_URL_PATTERN = /^data:image\/(png|jpeg|webp);base64,/;
const ASSET_PATH_PATTERN = /^\/[A-Za-z0-9_\-./]+\.(png|jpe?g|webp)$/;
// Older quotations stored the bundled signature's build-specific path:
// /src/assets/image.png when saved from the dev server, /assets/image-<hash>.png from a build.
const BUNDLED_SIGNATURE_PATTERN = /^\/(src\/)?assets\/image(-[\w-]+)?\.png$/;

interface SignatureFields {
    signature?: string | null;
    signatureMode?: SignatureMode | null;
}

/** Quotations saved before signature modes existed are digital when they carry an image. */
export const resolveSignatureMode = ({ signature, signatureMode }: SignatureFields): SignatureMode =>
    signatureMode ?? (signature ? 'DIGITAL' : 'PHYSICAL');

/** A loadable image URL for a stored signature, or '' when the value cannot be an image. */
export const resolveSignatureSrc = (signature: string | null | undefined): string => {
    if (!signature) return '';
    if (DATA_URL_PATTERN.test(signature)) return signature;
    if (BUNDLED_SIGNATURE_PATTERN.test(signature)) return DEFAULT_SIGNATURE;
    if (ASSET_PATH_PATTERN.test(signature) && !signature.includes('..')) return signature;
    return '';
};

/** The image a document should print before it has been checked to load; '' means the blank signing line. */
export const signatureCandidate = (fields: SignatureFields): string =>
    resolveSignatureMode(fields) === 'DIGITAL' ? resolveSignatureSrc(fields.signature) : '';

const loadResults = new Map<string, Promise<boolean>>();

export const canLoadImage = (src: string): Promise<boolean> => {
    let result = loadResults.get(src);
    if (!result) {
        result = new Promise<boolean>((resolve) => {
            const img = new Image();
            const timer = window.setTimeout(() => resolve(false), 10000);
            img.onload = () => {
                window.clearTimeout(timer);
                resolve(img.naturalWidth > 0);
            };
            img.onerror = () => {
                window.clearTimeout(timer);
                resolve(false);
            };
            img.src = src;
        });
        loadResults.set(src, result);
        // Failures are retried on the next request (e.g. after a network blip).
        result.then((ok) => { if (!ok) loadResults.delete(src); });
    }
    return result;
};

/** The image the PDF will contain, or null when it prints the blank physical signing area. */
export const getPrintableSignature = async (fields: SignatureFields): Promise<string | null> => {
    const src = signatureCandidate(fields);
    return src && (await canLoadImage(src)) ? src : null;
};

const decodeImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => (img.naturalWidth > 0 ? resolve(img) : reject(new Error('This file is not a valid image.')));
    img.onerror = () => reject(new Error('This file is not a valid image.'));
    img.src = url;
});

/**
 * Validates an uploaded signature and converts it to a compact PNG data URL. Photographed
 * signatures (no transparency) get their light paper background removed.
 */
export const prepareSignatureFile = async (file: File): Promise<string> => {
    if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Please choose a PNG, JPEG or WebP image.');
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('Signature image must be 5 MB or smaller.');

    const url = URL.createObjectURL(file);
    try {
        const img = await decodeImage(url);
        const scale = Math.min(1, MAX_WIDTH / img.naturalWidth, MAX_HEIGHT / img.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Your browser could not process this image.');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let hasTransparency = false;
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 250) { hasTransparency = true; break; }
        }
        if (!hasTransparency) {
            for (let i = 0; i < pixels.length; i += 4) {
                const luminance = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
                if (luminance > BACKGROUND_LUMINANCE) pixels[i + 3] = 0;
            }
            ctx.putImageData(imageData, 0, 0);
        }

        const dataUrl = canvas.toDataURL('image/png');
        const bytes = Math.ceil(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);
        if (bytes > MAX_SIGNATURE_BYTES) throw new Error('This image is too detailed. Please use a smaller or cleaner signature image.');
        return dataUrl;
    } finally {
        URL.revokeObjectURL(url);
    }
};

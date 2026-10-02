import ErrorResponse from './errorResponse';

export const SIGNATURE_MODES = ['DIGITAL', 'PHYSICAL'] as const;
export type SignatureMode = typeof SIGNATURE_MODES[number];

export const MAX_SIGNATURE_BYTES = 512 * 1024;
/** Base64 length of the largest accepted image plus its data URL prefix. */
export const MAX_SIGNATURE_LENGTH = Math.ceil(MAX_SIGNATURE_BYTES / 3) * 4 + 64;

const DATA_URL_PATTERN = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
// Quotations saved before signature uploads existed reference the bundled signature by its built asset path.
const LEGACY_ASSET_PATTERN = /^\/[A-Za-z0-9_\-./]+\.(png|jpe?g|webp)$/;

const MAGIC_BYTES: Record<string, (bytes: Buffer) => boolean> = {
    png: (bytes) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    jpeg: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
    webp: (bytes) => bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP',
};

/** Returns a user-facing error, or null when the value is an acceptable signature image. */
export const checkSignatureImage = (value: string): string | null => {
    if (LEGACY_ASSET_PATTERN.test(value) && !value.includes('..')) return null;

    const match = DATA_URL_PATTERN.exec(value);
    if (!match) return 'Signature must be a PNG, JPEG or WebP image';

    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > MAX_SIGNATURE_BYTES) return `Signature image must be at most ${MAX_SIGNATURE_BYTES / 1024} KB`;
    if (!MAGIC_BYTES[match[1]](bytes)) return 'Signature file is not a valid image';
    return null;
};

/** Quotations created before signature modes existed are digital when they carry an image. */
export const deriveSignatureMode = (mode: SignatureMode | null | undefined, signature: string | null | undefined): SignatureMode =>
    mode ?? (signature ? 'DIGITAL' : 'PHYSICAL');

interface SignatureFields {
    signature?: string | null;
    signatureMode?: SignatureMode | null;
}

/** Merges the request with the stored quotation; a digital signature must have an image to print. */
export const resolveSignatureConfig = (body: SignatureFields, existing?: SignatureFields) => {
    const signature = (body.signature !== undefined ? body.signature : existing?.signature) || '';
    const signatureMode = body.signatureMode ?? deriveSignatureMode(existing?.signatureMode, signature);

    if (signatureMode === 'DIGITAL' && !signature) {
        throw new ErrorResponse('Upload a digital signature or choose Physical Signature', 400);
    }

    return { signature, signatureMode };
};

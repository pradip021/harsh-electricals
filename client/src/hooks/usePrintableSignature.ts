import { useEffect, useState } from 'react';
import { SignatureMode } from '../types';
import { canLoadImage, resolveSignatureMode, signatureCandidate } from '../utils/signature';

/** physical: blank line chosen · missing: digital without an image · invalid: image failed to load. */
export type SignatureStatus = 'physical' | 'missing' | 'checking' | 'ready' | 'invalid';

/** Applies the same rules as `getPrintableSignature`, tracking the image check as React state. */
export const usePrintableSignature = (signature: string | null | undefined, signatureMode?: SignatureMode | null) => {
    const mode = resolveSignatureMode({ signature, signatureMode });
    const src = signatureCandidate({ signature, signatureMode: mode });
    const [checked, setChecked] = useState<{ src: string; ok: boolean } | null>(null);

    useEffect(() => {
        if (!src) return;
        let active = true;
        canLoadImage(src).then((ok) => {
            if (active) setChecked({ src, ok });
        });
        return () => { active = false; };
    }, [src]);

    let status: SignatureStatus;
    if (mode === 'PHYSICAL') status = 'physical';
    else if (!src) status = 'missing';
    else if (checked?.src !== src) status = 'checking';
    else status = checked.ok ? 'ready' : 'invalid';

    return { status, src: status === 'ready' ? src : null };
};

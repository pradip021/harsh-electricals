import { useState, useEffect, useCallback, useRef } from 'react';

export type NotesListStyle = 'bullet' | 'number';

const stripListPrefix = (line: string) => line.replace(/^(\d+\.|•)\s*/, '');

export const detectNotesListStyle = (notes: string): NotesListStyle => {
    const lines = notes.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return 'bullet';
    const numbered = lines.filter((l) => /^\d+\.\s/.test(l.trim())).length;
    return numbered >= Math.ceil(lines.length / 2) ? 'number' : 'bullet';
};

export const reformatNotesList = (notes: string, style: NotesListStyle): string => {
    const lines = notes.split('\n');
    if (lines.length === 0) return style === 'bullet' ? '• ' : '1. ';

    return lines
        .map((line, index) => {
            const text = stripListPrefix(line);
            if (style === 'bullet') {
                return text.trim() === '' && index === lines.length - 1 ? '• ' : `• ${text}`;
            }
            return text.trim() === '' && index === lines.length - 1
                ? `${index + 1}. `
                : `${index + 1}. ${text}`;
        })
        .join('\n');
};

const defaultNotesForStyle = (style: NotesListStyle) =>
    style === 'bullet' ? '• ' : '1. ';

interface NotesEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const NotesEditor = ({ value, onChange }: NotesEditorProps) => {
    const [listStyle, setListStyle] = useState<NotesListStyle>(() => detectNotesListStyle(value));
    const didSeed = useRef(false);

    useEffect(() => {
        if (didSeed.current || value.trim()) return;
        didSeed.current = true;
        onChange(defaultNotesForStyle(listStyle));
    }, [value, listStyle, onChange]);

    const applyListStyle = useCallback(
        (style: NotesListStyle) => {
            setListStyle(style);
            onChange(reformatNotesList(value.trim() ? value : defaultNotesForStyle(style), style));
        },
        [value, onChange]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value;
        if (listStyle === 'number') {
            onChange(reformatNotesList(next, 'number'));
            return;
        }
        onChange(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== 'Enter' || e.shiftKey) return;

        e.preventDefault();
        const ta = e.currentTarget;
        const { selectionStart, selectionEnd } = ta;
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);

        const prefix = listStyle === 'bullet' ? '• ' : `${before.split('\n').length + 1}. `;

        const newValue = `${before}\n${prefix}${after}`;
        onChange(listStyle === 'number' ? reformatNotesList(newValue, 'number') : newValue);

        requestAnimationFrame(() => {
            const cursor = selectionStart + 1 + prefix.length;
            ta.selectionStart = ta.selectionEnd = cursor;
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">
                    Terms &amp; Notes
                </label>
                <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900 p-0.5">
                    <button
                        type="button"
                        onClick={() => applyListStyle('bullet')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            listStyle === 'bullet'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        Bullet (•)
                    </button>
                    <button
                        type="button"
                        onClick={() => applyListStyle('number')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            listStyle === 'number'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        Numbered (1.)
                    </button>
                </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium -mt-2 ml-1">
                Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 font-mono text-[10px]">Enter</kbd> for a new line with the selected style. Use Shift+Enter for a plain line break inside one point.
            </p>
            <textarea
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                rows={5}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-700 dark:text-gray-300 min-h-[140px] resize-y leading-relaxed"
                placeholder="• Payment terms, warranty, exclusions..."
            />
        </div>
    );
};

export default NotesEditor;

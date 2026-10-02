import { useReducer, useCallback, useMemo } from 'react';
import { CellValue, CustomUnit, Quotation, QuotationItem, SignatureMode, TableColumn } from '../types';
import { DEFAULT_SIGNATURE, resolveSignatureMode, resolveSignatureSrc } from '../utils/signature';
import { buildDefaultValues, createDefaultColumns, normalizeColumns, reconcileItemsWithColumns } from '../utils/tableColumns';
import { UnitSelection } from '../utils/units';

// Action types
const ACTIONS = {
    SET_CLIENT_NAME: 'SET_CLIENT_NAME',
    SET_DATE: 'SET_DATE',
    SET_REF: 'SET_REF',
    SET_ADDRESS: 'SET_ADDRESS',
    SET_SUBJECT: 'SET_SUBJECT',
    SET_MESSAGE: 'SET_MESSAGE',
    SET_NOTES: 'SET_NOTES',
    SET_SIGNATURE: 'SET_SIGNATURE',
    SET_SIGNATURE_MODE: 'SET_SIGNATURE_MODE',
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_ITEM: 'UPDATE_ITEM',
    RESET_FORM: 'RESET_FORM',
    LOAD_QUOTATION: 'LOAD_QUOTATION',
    ADD_SECTION: 'ADD_SECTION',
    TOGGLE_GST: 'TOGGLE_GST',
    SET_GST_RATE: 'SET_GST_RATE',
    SET_COLUMNS: 'SET_COLUMNS',
    UPDATE_ITEM_VALUE: 'UPDATE_ITEM_VALUE',
    SET_ITEM_UNIT: 'SET_ITEM_UNIT',
    APPLY_UNIT_TO_ALL: 'APPLY_UNIT_TO_ALL',
    SYNC_UNIT_NAMES: 'SYNC_UNIT_NAMES',
} as const;

type Action =
    | { type: typeof ACTIONS.SET_CLIENT_NAME; payload: string }
    | { type: typeof ACTIONS.SET_DATE; payload: string }
    | { type: typeof ACTIONS.SET_REF; payload: string }
    | { type: typeof ACTIONS.SET_ADDRESS; payload: string }
    | { type: typeof ACTIONS.SET_SUBJECT; payload: string }
    | { type: typeof ACTIONS.SET_MESSAGE; payload: string }
    | { type: typeof ACTIONS.SET_NOTES; payload: string }
    | { type: typeof ACTIONS.SET_SIGNATURE; payload: string }
    | { type: typeof ACTIONS.SET_SIGNATURE_MODE; payload: SignatureMode }
    | { type: typeof ACTIONS.ADD_ITEM }
    | { type: typeof ACTIONS.ADD_SECTION }
    | { type: typeof ACTIONS.TOGGLE_GST }
    | { type: typeof ACTIONS.SET_GST_RATE; payload: number }
    | { type: typeof ACTIONS.REMOVE_ITEM; payload: string }
    | { type: typeof ACTIONS.UPDATE_ITEM; payload: { id: string; field: keyof QuotationItem; value: any } }
    | { type: typeof ACTIONS.SET_COLUMNS; payload: TableColumn[] }
    | { type: typeof ACTIONS.UPDATE_ITEM_VALUE; payload: { id: string; columnId: string; value: CellValue } }
    | { type: typeof ACTIONS.SET_ITEM_UNIT; payload: { id: string; selection: UnitSelection } }
    | { type: typeof ACTIONS.APPLY_UNIT_TO_ALL; payload: UnitSelection }
    | { type: typeof ACTIONS.SYNC_UNIT_NAMES; payload: CustomUnit[] }
    | { type: typeof ACTIONS.RESET_FORM }
    | { type: typeof ACTIONS.LOAD_QUOTATION; payload: Quotation };

// Initial state
const initialState: Omit<Quotation, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id: string } = {
    id: '',
    clientName: '',
    clientAddress: '',
    date: new Date().toISOString().split('T')[0],
    ref: '',
    subject: '',
    message: 'Dear Sir,',
    notes: '• 50% advance payment and 50% after work finish.',
    signature: DEFAULT_SIGNATURE,
    signatureMode: 'DIGITAL',
    gstEnabled: false,
    gstRate: 18,
    totalAmount: 0,
    columns: createDefaultColumns(),
    items: [
        {
            id: crypto.randomUUID(),
            pointName: '',
            description: '',
            qty: 1,
            unit: 'Nos',
            rate: 0,
            amount: 0,
            isSection: false,
        },
    ],
};

/** Text quantities (descriptive units) count as 1 when present. */
const calculateAmount = (rawQty: any, rawRate: any) => {
    const qty = parseFloat(rawQty);
    const rate = parseFloat(rawRate) || 0;
    const effectiveQty = isNaN(qty) ? (rawQty ? 1 : 0) : qty;
    return effectiveQty * rate;
};

const withUnit = (item: QuotationItem, { unit, unitId }: UnitSelection): QuotationItem => ({
    ...item,
    unit,
    unitId,
    amount: calculateAmount(item.qty, item.rate),
});

/** Assign stable unique ids so UPDATE_ITEM targets a single row (API items use _id, not id). */
const ensureUniqueItemIds = (items: QuotationItem[]): QuotationItem[] => {
    const seen = new Set<string>();
    return items.map((item) => {
        const raw = item as QuotationItem & { _id?: string | { toString(): string } };
        let id = item.id || (typeof raw._id === 'string' ? raw._id : raw._id?.toString?.());
        if (!id || seen.has(id)) {
            id = crypto.randomUUID();
        }
        seen.add(id);
        return { ...item, id };
    });
};

// Reducer function
const quotationReducer = (state: any, action: Action): any => {
    switch (action.type) {
        case ACTIONS.SET_CLIENT_NAME:
            return { ...state, clientName: action.payload };

        case ACTIONS.SET_DATE:
            return { ...state, date: action.payload };

        case ACTIONS.SET_REF:
            return { ...state, ref: action.payload };

        case ACTIONS.SET_ADDRESS:
            return { ...state, clientAddress: action.payload };

        case ACTIONS.SET_SUBJECT:
            return { ...state, subject: action.payload };

        case ACTIONS.SET_MESSAGE:
            return { ...state, message: action.payload };

        case ACTIONS.SET_NOTES:
            return { ...state, notes: action.payload };

        case ACTIONS.SET_SIGNATURE:
            return { ...state, signature: action.payload };

        // Only the mode changes: a digital signature stays stored while PHYSICAL is selected.
        case ACTIONS.SET_SIGNATURE_MODE:
            return { ...state, signatureMode: action.payload };

        case ACTIONS.ADD_ITEM:
            return {
                ...state,
                items: [
                    ...state.items,
                    {
                        id: crypto.randomUUID(),
                        pointName: '',
                        description: '',
                        qty: 1,
                        unit: 'Nos',
                        rate: 0,
                        amount: 0,
                        isSection: false,
                        values: buildDefaultValues(state.columns),
                    },
                ],
            };

        case ACTIONS.ADD_SECTION:
            return {
                ...state,
                items: [
                    ...state.items,
                    {
                        id: crypto.randomUUID(),
                        pointName: 'NEW SECTION',
                        description: '',
                        qty: '',
                        unit: '',
                        rate: 0,
                        amount: 0,
                        isSection: true,
                    },
                ],
            };

        case ACTIONS.TOGGLE_GST:
            return { ...state, gstEnabled: !state.gstEnabled };

        case ACTIONS.SET_GST_RATE:
            return { ...state, gstRate: action.payload };

        case ACTIONS.REMOVE_ITEM:
            return {
                ...state,
                items: state.items.filter((item: any) => item.id !== action.payload),
            };

        case ACTIONS.UPDATE_ITEM: {
            const { id, field, value } = action.payload;
            return {
                ...state,
                items: state.items.map((item: any) => {
                    if (item.id !== id) return item;

                    const updatedItem = { ...item, [field]: value };

                    if (!item.isSection && (field === 'qty' || field === 'rate' || field === 'unit')) {
                        const rawQty = field === 'qty' ? value : item.qty;
                        const rawRate = field === 'rate' ? value : item.rate;
                        updatedItem.amount = calculateAmount(rawQty, rawRate);
                    }

                    return updatedItem;
                }),
            };
        }

        case ACTIONS.UPDATE_ITEM_VALUE: {
            const { id, columnId, value } = action.payload;
            return {
                ...state,
                items: state.items.map((item: QuotationItem) =>
                    item.id === id ? { ...item, values: { ...item.values, [columnId]: value } } : item
                ),
            };
        }

        case ACTIONS.SET_ITEM_UNIT: {
            const { id, selection } = action.payload;
            return {
                ...state,
                items: state.items.map((item: QuotationItem) =>
                    item.id === id && !item.isSection ? withUnit(item, selection) : item
                ),
            };
        }

        case ACTIONS.APPLY_UNIT_TO_ALL:
            return {
                ...state,
                items: state.items.map((item: QuotationItem) => (item.isSection ? item : withUnit(item, action.payload))),
            };

        case ACTIONS.SYNC_UNIT_NAMES: {
            const names = new Map(action.payload.map((u) => [u._id, u.name]));
            let changed = false;
            const items = state.items.map((item: QuotationItem) => {
                const name = item.unitId ? names.get(item.unitId) : undefined;
                if (!name || name === item.unit) return item;
                changed = true;
                return { ...item, unit: name };
            });
            return changed ? { ...state, items } : state;
        }

        case ACTIONS.SET_COLUMNS: {
            const columns = normalizeColumns(action.payload);
            return {
                ...state,
                columns,
                items: reconcileItemsWithColumns(state.items, state.columns, columns),
            };
        }

        case ACTIONS.RESET_FORM:
            return { ...initialState, id: crypto.randomUUID(), columns: createDefaultColumns() };

        case ACTIONS.LOAD_QUOTATION: {
            const payload = action.payload;
            const columns = normalizeColumns(payload.columns);
            const items = reconcileItemsWithColumns(ensureUniqueItemIds(payload.items || []), columns, columns);
            // A stored value that can never load as an image is treated as "no signature uploaded".
            const signature = resolveSignatureSrc(payload.signature) ? payload.signature : '';
            // The API returns ISO timestamps; the date input only accepts YYYY-MM-DD.
            const date = typeof payload.date === 'string' ? payload.date.slice(0, 10) : payload.date;
            return { ...payload, columns, items, date, signature, signatureMode: resolveSignatureMode(payload) };
        }

        default:
            return state;
    }
};

// Custom hook
export const useQuotationReducer = (initialQuotation: Quotation | null = null) => {
    const [state, dispatch] = useReducer(
        quotationReducer,
        initialQuotation || { ...initialState, id: crypto.randomUUID() }
    );

    const setClientName = useCallback((name: string) => {
        dispatch({ type: ACTIONS.SET_CLIENT_NAME, payload: name });
    }, []);

    const setDate = useCallback((date: string) => {
        dispatch({ type: ACTIONS.SET_DATE, payload: date });
    }, []);

    const setRef = useCallback((ref: string) => {
        dispatch({ type: ACTIONS.SET_REF, payload: ref });
    }, []);

    const setAddress = useCallback((address: string) => {
        dispatch({ type: ACTIONS.SET_ADDRESS, payload: address });
    }, []);

    const setSubject = useCallback((subject: string) => {
        dispatch({ type: ACTIONS.SET_SUBJECT, payload: subject });
    }, []);

    const setMessage = useCallback((message: string) => {
        dispatch({ type: ACTIONS.SET_MESSAGE, payload: message });
    }, []);

    const setNotes = useCallback((notes: string) => {
        dispatch({ type: ACTIONS.SET_NOTES, payload: notes });
    }, []);

    const setSignature = useCallback((signature: string) => {
        dispatch({ type: ACTIONS.SET_SIGNATURE, payload: signature });
    }, []);

    const setSignatureMode = useCallback((mode: SignatureMode) => {
        dispatch({ type: ACTIONS.SET_SIGNATURE_MODE, payload: mode });
    }, []);

    const addItem = useCallback(() => {
        dispatch({ type: ACTIONS.ADD_ITEM });
    }, []);

    const removeItem = useCallback((id: string) => {
        dispatch({ type: ACTIONS.REMOVE_ITEM, payload: id });
    }, []);

    const updateItem = useCallback((id: string, field: keyof QuotationItem, value: any) => {
        dispatch({ type: ACTIONS.UPDATE_ITEM, payload: { id, field, value } });
    }, []);

    const resetForm = useCallback(() => {
        dispatch({ type: ACTIONS.RESET_FORM });
    }, []);

    const loadQuotation = useCallback((quotation: Quotation) => {
        dispatch({ type: ACTIONS.LOAD_QUOTATION, payload: quotation });
    }, []);

    const loadTemplate = useCallback((template: any) => {
        const templateItems = template.items.map((item: any) => ({
            id: crypto.randomUUID(),
            pointName: item.pointName,
            description: item.description || '',
            qty: item.qty || 1,
            unit: item.unit || 'Nos',
            isSection: !!item.isSection,
            rate: item.rate,
            amount: (parseFloat(item.qty) || 1) * item.rate,
        }));

        dispatch({
            type: ACTIONS.LOAD_QUOTATION,
            payload: {
                ...initialState,
                id: crypto.randomUUID(),
                columns: createDefaultColumns(),
                items: templateItems,
            } as any,
        });
    }, []);

    const subtotal = useMemo(() => {
        return state.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    }, [state.items]);

    const gstAmount = useMemo(() => {
        return state.gstEnabled ? (subtotal * state.gstRate) / 100 : 0;
    }, [subtotal, state.gstEnabled, state.gstRate]);

    const totalAmount = useMemo(() => {
        return subtotal + gstAmount;
    }, [subtotal, gstAmount]);

    const toggleGST = useCallback(() => {
        dispatch({ type: ACTIONS.TOGGLE_GST });
    }, []);

    const setGSTRate = useCallback((rate: number) => {
        dispatch({ type: ACTIONS.SET_GST_RATE, payload: rate });
    }, []);

    const addSection = useCallback(() => {
        dispatch({ type: ACTIONS.ADD_SECTION });
    }, []);

    const setColumns = useCallback((columns: TableColumn[]) => {
        dispatch({ type: ACTIONS.SET_COLUMNS, payload: columns });
    }, []);

    const updateItemValue = useCallback((id: string, columnId: string, value: CellValue) => {
        dispatch({ type: ACTIONS.UPDATE_ITEM_VALUE, payload: { id, columnId, value } });
    }, []);

    const setItemUnit = useCallback((id: string, selection: UnitSelection) => {
        dispatch({ type: ACTIONS.SET_ITEM_UNIT, payload: { id, selection } });
    }, []);

    const applyUnitToAll = useCallback((selection: UnitSelection) => {
        dispatch({ type: ACTIONS.APPLY_UNIT_TO_ALL, payload: selection });
    }, []);

    const syncUnitNames = useCallback((units: CustomUnit[]) => {
        dispatch({ type: ACTIONS.SYNC_UNIT_NAMES, payload: units });
    }, []);

    return {
        state,
        totalAmount,
        subtotal,
        gstAmount,
        setClientName,
        setDate,
        setRef,
        setAddress,
        setSubject,
        setMessage,
        setNotes,
        setSignature,
        setSignatureMode,
        addItem,
        removeItem,
        updateItem,
        resetForm,
        loadQuotation,
        loadTemplate,
        toggleGST,
        setGSTRate,
        addSection,
        setColumns,
        updateItemValue,
        setItemUnit,
        applyUnitToAll,
        syncUnitNames,
    };
};

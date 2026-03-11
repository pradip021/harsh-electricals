import { useReducer, useCallback, useMemo } from 'react';
// import defaultSignature from '../assets/image.png';
import defaultSignature from '../assets/image.png';
import { Quotation, QuotationItem } from '../types';

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
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_ITEM: 'UPDATE_ITEM',
    RESET_FORM: 'RESET_FORM',
    LOAD_QUOTATION: 'LOAD_QUOTATION',
    ADD_SECTION: 'ADD_SECTION',
    TOGGLE_GST: 'TOGGLE_GST',
    SET_GST_RATE: 'SET_GST_RATE',
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
    | { type: typeof ACTIONS.ADD_ITEM }
    | { type: typeof ACTIONS.ADD_SECTION }
    | { type: typeof ACTIONS.TOGGLE_GST }
    | { type: typeof ACTIONS.SET_GST_RATE; payload: number }
    | { type: typeof ACTIONS.REMOVE_ITEM; payload: string }
    | { type: typeof ACTIONS.UPDATE_ITEM; payload: { id: string; field: keyof QuotationItem; value: any } }
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
    signature: defaultSignature,
    gstEnabled: false,
    gstRate: 18,
    totalAmount: 0,
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

                        const qty = parseFloat(rawQty);
                        const rate = parseFloat(rawRate) || 0;

                        const effectiveQty = isNaN(qty) ? (rawQty ? 1 : 0) : qty;
                        updatedItem.amount = effectiveQty * rate;
                    }

                    return updatedItem;
                }),
            };
        }

        case ACTIONS.RESET_FORM:
            return { ...initialState, id: crypto.randomUUID() };

        case ACTIONS.LOAD_QUOTATION:
            return action.payload;

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
        addItem,
        removeItem,
        updateItem,
        resetForm,
        loadQuotation,
        loadTemplate,
        toggleGST,
        setGSTRate,
        addSection,
    };
};

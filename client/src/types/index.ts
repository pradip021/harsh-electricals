export interface User {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    token?: string;
}

export type ColumnType = 'text' | 'number';
export type ColumnValueMode = 'MANUAL' | 'AUTO_INCREMENT';
export type SystemColumnKey = 'description' | 'qty' | 'rate' | 'amount';
export type CellValue = string | number | null;

export interface AutoIncrementConfig {
    start: number;
    step: number;
    /** Restart numbering whenever the value in this (manual) column changes. */
    resetOnColumnId?: string | null;
}

export interface TableColumn {
    id: string;
    name: string;
    type: ColumnType;
    position: number;
    width?: number | null;
    valueMode: ColumnValueMode;
    autoIncrement?: AutoIncrementConfig | null;
    defaultValue?: CellValue;
    editable: boolean;
    /** Set for built-in columns backed by fixed item fields; null for user-defined columns. */
    systemKey?: SystemColumnKey | null;
}

export interface CustomUnit {
    _id: string;
    name: string;
    user?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface QuotationItem {
    id: string;
    pointName: string;
    description: string;
    /** System unit code (e.g. 'Nos', 'Text') or the display name of the custom unit in `unitId`. */
    unit: string;
    unitId?: string | null;
    qty: number | string;
    rate: number | string;
    amount: number;
    isSection: boolean;
    /** Values of user-defined columns, keyed by column id. */
    values?: Record<string, CellValue>;
}

/** DIGITAL prints the uploaded image; PHYSICAL leaves a blank line to sign after printing. */
export type SignatureMode = 'DIGITAL' | 'PHYSICAL';

export interface Quotation {
    _id?: string;
    id?: string;
    clientName: string;
    date: string;
    ref: string;
    clientAddress: string;
    subject: string;
    message: string;
    columns?: TableColumn[];
    items: QuotationItem[];
    notes: string;
    /** Digital signature image; kept while PHYSICAL is selected so switching back restores it. */
    signature: string;
    signatureMode?: SignatureMode;
    gstEnabled: boolean;
    gstRate: number;
    totalAmount: number;
    user?: string | User;
    createdAt?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
}

export interface UserResponse {
    success: boolean;
    data: User;
}

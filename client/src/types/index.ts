export interface User {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    token?: string;
}

export interface QuotationItem {
    id: string;
    pointName: string;
    description: string;
    unit: string;
    qty: number | string;
    rate: number | string;
    amount: number;
    isSection: boolean;
}

export interface Quotation {
    _id?: string;
    id?: string;
    clientName: string;
    date: string;
    ref: string;
    clientAddress: string;
    subject: string;
    message: string;
    items: QuotationItem[];
    notes: string;
    signature: string;
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

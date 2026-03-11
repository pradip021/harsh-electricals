import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem {
    pointName: string;
    description: string;
    qty: string | number;
    unit: string;
    rate: number;
    amount: number;
    isSection: boolean;
}

export interface IQuotation extends Document {
    user: mongoose.Types.ObjectId;
    clientName: string;
    clientAddress: string;
    date: Date;
    ref: string;
    subject: string;
    message: string;
    notes: string;
    signature: string;
    gstEnabled: boolean;
    gstRate: number;
    items: IQuotationItem[];
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    status: 'draft' | 'sent' | 'paid';
    createdAt: Date;
}

const QuotationSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clientName: {
        type: String,
        required: [true, 'Please add client name'],
    },
    clientAddress: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    ref: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
        default: 'Dear Sir,',
    },
    notes: {
        type: String,
        default: '• 50% advance payment and 50% after work finish.',
    },
    signature: {
        type: String,
    },
    gstEnabled: {
        type: Boolean,
        default: false,
    },
    gstRate: {
        type: Number,
        default: 18,
    },
    items: [{
        pointName: { type: String, required: true },
        description: { type: String, default: '' },
        qty: { type: Schema.Types.Mixed, default: 1 },
        unit: { type: String, default: 'Nos' },
        rate: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
        isSection: { type: Boolean, default: false }
    }],
    subtotal: {
        type: Number,
        default: 0
    },
    gstAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid'],
        default: 'draft'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IQuotation>('Quotation', QuotationSchema);

import mongoose, { Schema, Document } from 'mongoose';
import { CellValue, COLUMN_TYPES, createDefaultColumns, TableColumn, VALUE_MODES } from '../utils/quotationTable';
import { deriveSignatureMode, SIGNATURE_MODES, SignatureMode } from '../utils/signature';

export interface IQuotationItem {
    pointName: string;
    description: string;
    qty: string | number;
    unit: string;
    unitId?: mongoose.Types.ObjectId | string | null;
    rate: number;
    amount: number;
    isSection: boolean;
    values?: Map<string, CellValue>;
}

const AutoIncrementSchema = new Schema({
    start: { type: Number, required: true },
    step: { type: Number, required: true },
    resetOnColumnId: { type: String, default: null },
}, { _id: false });

const ColumnSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: COLUMN_TYPES, required: true },
    position: { type: Number, required: true },
    width: { type: Number, default: null },
    valueMode: { type: String, enum: VALUE_MODES, required: true },
    autoIncrement: { type: AutoIncrementSchema, default: null },
    defaultValue: { type: Schema.Types.Mixed, default: null },
    editable: { type: Boolean, default: true },
    systemKey: { type: String, default: null },
}, { _id: false, id: false });

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
    signatureMode?: SignatureMode;
    gstEnabled: boolean;
    gstRate: number;
    columns?: TableColumn[];
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
    // Digital signature image (data URL, or the bundled asset path on older quotations).
    signature: {
        type: String,
    },
    // Absent on quotations created before signature modes; see toJSON below.
    signatureMode: {
        type: String,
        enum: SIGNATURE_MODES,
    },
    gstEnabled: {
        type: Boolean,
        default: false,
    },
    gstRate: {
        type: Number,
        default: 18,
    },
    // Absent on quotations created before configurable columns; see toJSON below.
    columns: {
        type: [ColumnSchema],
        default: undefined,
    },
    items: [{
        pointName: { type: String, required: true },
        description: { type: String, default: '' },
        qty: { type: Schema.Types.Mixed, default: 1 },
        unit: { type: String, default: 'Nos' },
        // Set for custom units; `unit` then holds a display copy of the unit's name.
        unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: null },
        rate: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
        isSection: { type: Boolean, default: false },
        values: { type: Map, of: Schema.Types.Mixed, default: undefined },
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

QuotationSchema.set('toJSON', {
    flattenMaps: true,
    transform: (_doc: unknown, ret: any) => {
        if (!Array.isArray(ret.columns) || ret.columns.length === 0) {
            ret.columns = createDefaultColumns();
        }
        ret.signatureMode = deriveSignatureMode(ret.signatureMode, ret.signature);
        return ret;
    },
});

export default mongoose.model<IQuotation>('Quotation', QuotationSchema);

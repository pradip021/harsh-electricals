import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplateItem {
    pointName: string;
    description: string;
    qty: string | number;
    unit: string;
    rate: number;
    isSection: boolean;
}

export interface ITemplate extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    description: string;
    items: ITemplateItem[];
    isCustom: boolean;
    createdAt: Date;
}

const TemplateSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add template name'],
    },
    description: {
        type: String,
    },
    items: [{
        pointName: { type: String, required: true },
        description: { type: String, default: '' },
        qty: { type: Schema.Types.Mixed, default: 0 },
        unit: { type: String, default: 'Nos' },
        rate: { type: Number, default: 0 },
        isSection: { type: Boolean, default: false }
    }],
    isCustom: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<ITemplate>('Template', TemplateSchema);

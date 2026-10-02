import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    /** Case-insensitive uniqueness key (normalized, lower-cased name). */
    nameKey: string;
    createdAt: Date;
    updatedAt: Date;
}

const UnitSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add a unit name'],
        trim: true,
    },
    nameKey: {
        type: String,
        required: true,
    },
}, { timestamps: true });

UnitSchema.index({ user: 1, nameKey: 1 }, { unique: true });

UnitSchema.set('toJSON', {
    transform: (_doc: unknown, ret: any) => {
        delete ret.nameKey;
        delete ret.__v;
        return ret;
    },
});

export default mongoose.model<IUnit>('Unit', UnitSchema);

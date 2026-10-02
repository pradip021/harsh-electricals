import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
    getSignedJwtToken(): string;
}

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT || '10'));
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (this: IUser) {
    const options: jwt.SignOptions = {
        expiresIn: (process.env.JWT_EXPIRE as any) || '30d'
    };
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'secret', options);
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (this: IUser, enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'customer' | 'business' | 'reprocessor' | 'admin';
  isVerified: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    passwordHash: { type: String, required: false }, // Optional for OAuth users
    role: {
      type: String,
      enum: ['customer', 'business', 'reprocessor', 'admin'],
      required: true,
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);

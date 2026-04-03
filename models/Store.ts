import { Schema, Document, model, models } from 'mongoose';

export interface IStore extends Document {
  userId: string;
  name?: string;
  category?: string;
  address?: string;
  lat?: number;
  lng?: number;
  logoUrl?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    userId: { type: String, required: true, ref: 'User' },
    name: { type: String },
    category: { type: String },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    logoUrl: { type: String },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: { type: String, ref: 'User' },
  },
  { timestamps: true }
);

export default models.Store || model<IStore>('Store', StoreSchema);

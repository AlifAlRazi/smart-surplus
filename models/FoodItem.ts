import { Schema, Document, model, models } from 'mongoose';

export interface IFoodItem extends Document {
  storeId: string;
  name: string;
  category: 'groceries' | 'bakery' | 'meals' | 'other';
  quantity: number;
  quantityRemaining: number;
  originalPrice: number;
  discountedPrice: number;
  pickupStart: Date;
  pickupEnd: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'reprocessing' | 'done';
  imageUrl?: string;
  createdAt: Date;
}

const FoodItemSchema = new Schema<IFoodItem>(
  {
    storeId: { type: String, required: true, ref: 'Store' },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['groceries', 'bakery', 'meals', 'other'],
      required: true,
    },
    quantity: { type: Number, required: true },
    quantityRemaining: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    pickupStart: { type: Date, required: true },
    pickupEnd: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'reprocessing', 'done'],
      default: 'active',
    },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default models.FoodItem || model<IFoodItem>('FoodItem', FoodItemSchema);

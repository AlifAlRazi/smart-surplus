import { Schema, Document, model, models } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  foodItemId: string;
  quantity: number;
  totalPrice: number;
  status: 'reserved' | 'confirmed' | 'collected' | 'cancelled';
  reservedUntil: Date;
  collectionCode?: string;
  stripePaymentId?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, ref: 'User' },
    foodItemId: { type: String, required: true, ref: 'FoodItem' },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['reserved', 'confirmed', 'collected', 'cancelled'],
      default: 'reserved',
    },
    reservedUntil: { type: Date, required: true },
    collectionCode: { type: String },
    stripePaymentId: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    ratingComment: { type: String },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>('Order', OrderSchema);

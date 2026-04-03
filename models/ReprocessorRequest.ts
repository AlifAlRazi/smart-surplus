import { Schema, Document, model, models } from 'mongoose';

export interface IReprocessorRequest extends Document {
  userId: string;
  foodItemId: string;
  quantity: number;
  status: 'requested' | 'collected';
  createdAt: Date;
}

const ReprocessorRequestSchema = new Schema<IReprocessorRequest>(
  {
    userId: { type: String, required: true, ref: 'User' },
    foodItemId: { type: String, required: true, ref: 'FoodItem' },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ['requested', 'collected'],
      default: 'requested',
    },
  },
  { timestamps: true }
);

export default models.ReprocessorRequest ||
  model<IReprocessorRequest>('ReprocessorRequest', ReprocessorRequestSchema);

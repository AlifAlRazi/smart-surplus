import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FoodItem from '@/models/FoodItem';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  // Simple auth to ensure only Vercel Cron or manual admin triggers this
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === 'production'
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  await dbConnect();
  
  try {
    const now = new Date();

    // 1. Mark active FoodItems as expired if they have passed expiresAt
    const foodUpdateResult = await FoodItem.updateMany(
      { status: 'active', expiresAt: { $lt: now } },
      { $set: { status: 'expired' } }
    );

    // 2. Release stale reservations (reservedUntil passed, still "reserved")
    const staleOrders = await Order.find({
       status: 'reserved',
       reservedUntil: { $lte: now }
    });

    let ordersCancelled = 0;
    const cancelledOrderIds: string[] = [];

    if (staleOrders.length > 0) {
       const session = await mongoose.startSession();
       try {
          await session.withTransaction(async () => {
             for (const order of staleOrders) {
                await Order.updateOne(
                   { _id: order._id },
                   { $set: { status: 'cancelled' } },
                   { session }
                );

                await FoodItem.updateOne(
                   { _id: order.foodItemId },
                   { $inc: { quantityRemaining: order.quantity } },
                   { session }
                );

                ordersCancelled++;
                cancelledOrderIds.push(order._id.toString());
             }
          });
       } finally {
          await session.endSession();
       }
    }

    return NextResponse.json({
       success: true,
       foodItemsExpired: foodUpdateResult.modifiedCount,
       ordersCancelled: ordersCancelled,
       cancelledOrderIds: cancelledOrderIds,
       timestamp: now.toISOString()
    });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}

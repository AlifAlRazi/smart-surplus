import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import FoodItem from '@/models/FoodItem';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper to generate a random 6-character alphanumeric code
function generateCollectionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 1, 0 for clarity
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new NextResponse('Webhook secret missing', { status: 500 });
  }

  const payload = await req.text();
  const signature = headers().get('Stripe-Signature');

  if (!signature) {
    return new NextResponse('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  await dbConnect();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // We embedded our MongoDB Order ID into the client_reference_id
    const orderId = session.client_reference_id;
    
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.status === 'reserved') {
        const code = generateCollectionCode();
        
        order.status = 'confirmed';
        order.collectionCode = code;
        await order.save();
        
        console.log(`Order ${orderId} confirmed with code: ${code}`);
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
     const session = event.data.object as Stripe.Checkout.Session;
     const orderId = session.client_reference_id;
     
     if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.status === 'reserved') {
           // Release the stock back
           order.status = 'cancelled';
           await order.save();
           
           await FoodItem.findByIdAndUpdate(order.foodItemId, {
              $inc: { quantityRemaining: 1 }
           });
           
           console.log(`Order ${orderId} expired. Stock released.`);
        }
     }
  }

  return new NextResponse('OK', { status: 200 });
}

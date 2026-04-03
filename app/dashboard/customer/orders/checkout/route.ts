import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import FoodItem from '@/models/FoodItem';
import Order from '@/models/Order';
import Store from '@/models/Store';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'customer') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const itemId = formData.get('itemId') as string;

    if (!itemId) {
      return new NextResponse('Item ID is required', { status: 400 });
    }

    await dbConnect();

    // 1. Atomically attempt to decrement quantity to "lock" the reservation
    const item = await FoodItem.findOneAndUpdate(
      { 
        _id: itemId, 
        status: 'active', 
        quantityRemaining: { $gt: 0 },
        expiresAt: { $gt: new Date() } 
      },
      { $inc: { quantityRemaining: -1 } },
      { new: true }
    ).populate({ path: 'storeId', model: Store });

    if (!item) {
       // Item is either sold out, expired, or doesn't exist
       // Redirect back to listing with error
       return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/customer/listings/${itemId}?error=sold_out`, { status: 303 });
    }

    // 2. Create Pending Order in Database
    const order = await Order.create({
      userId: (session.user as any).id,
      foodItemId: item._id,
      storeId: item.storeId._id,
      quantity: 1, // Currently fixed to 1 bag per checkout
      totalPrice: item.discountedPrice,
      status: 'reserved',
      reservedUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      // collectionCode will be generated via webhook upon successful payment
    });

    // 3. Create Stripe Checkout Session
    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // In dev mode without a valid token, just auto-confirm (bypass Stripe)
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('...')) {
       console.log("Stripe not configured - bypassing checkout for dev testing.");
       
       // Generate dummy code
       const code = Math.random().toString(36).substring(2, 8).toUpperCase();
       await Order.findByIdAndUpdate(order._id, { status: 'confirmed', collectionCode: code });
       
       return NextResponse.redirect(`${origin}/dashboard/customer/orders/${order._id.toString()}`, { status: 303 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user?.email || undefined,
      client_reference_id: order._id.toString(), // Important: link back to our Order ID
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Surplus Bag: ${item.name}`,
              description: `Pickup from ${(item.storeId as any).name}`,
            },
            unit_amount: Math.round(item.discountedPrice * 100), // convert to pence
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/customer/orders/${order._id.toString()}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/customer/listings/${itemId}?canceled=true`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 mins
    });

    if (!stripeSession.url) {
      throw new Error("Could not create Stripe session");
    }

    // Redirect user to Stripe
    return NextResponse.redirect(stripeSession.url, { status: 303 });

  } catch (err: any) {
    console.error("Checkout error:", err);
    return new NextResponse(err.message || 'Internal Server Error', { status: 500 });
  }
}

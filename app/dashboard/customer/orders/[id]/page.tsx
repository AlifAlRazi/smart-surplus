import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import FoodItem from "@/models/FoodItem";
import Store from "@/models/Store";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, Clock, Star, Calendar } from "lucide-react";
import Stripe from 'stripe';
import { RatingForm } from "@/components/rating-form";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

function generateCollectionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { session_id?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "customer") redirect("/auth/login");

  await dbConnect();

  const order = await Order.findById(params.id)
    .populate({ path: 'foodItemId', model: FoodItem })
    .populate({ path: 'storeId', model: Store });

  if (!order || order.userId.toString() !== (session.user as any).id) {
     return <div className="p-8 text-center text-rose-500 font-bold">Unauthorized or order not found.</div>;
  }

  // Fallback: This helps complete the flow seamlessly on localhost where webhooks might not be running!
  if (order.status === 'reserved' && searchParams.session_id) {
     try {
        const stripeSession = await stripe.checkout.sessions.retrieve(searchParams.session_id);
        if (stripeSession.payment_status === 'paid') {
           order.status = 'confirmed';
           order.collectionCode = generateCollectionCode();
           await order.save();
        }
     } catch (e) {
        console.error("Manual Stripe verification error:", e);
     }
  }

  // @ts-ignore
  const item = order.foodItemId;
  // @ts-ignore
  const store = order.storeId;

  // Add to Calendar helper
  const createCalendarUrl = (item: any, store: any) => {
    const formatICS = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    const text = encodeURIComponent(`Smart Surplus Pickup: ${item.name}`);
    const details = encodeURIComponent(`Pickup your surprise bag from ${store.name}. Collection Code: ${order.collectionCode || 'Pending'}`);
    const location = encodeURIComponent(store.address);
    const start = formatICS(new Date(item.pickupStart));
    const end = formatICS(new Date(item.pickupEnd));
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto mt-8 mb-20">
       <div className="bg-white p-8 sm:p-12 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-500/10 text-center">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${order.status === 'collected' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
             {order.status === 'confirmed' ? 'Order Confirmed!' : order.status === 'collected' ? 'Order Collected' : 'Order Details'}
          </h1>
          <p className="mt-2 text-slate-600 mb-8">
             {order.status === 'confirmed' 
                ? "Your surplus food is ready for pickup during the window below."
                : order.status === 'collected'
                ? "Thank you for rescuing this surplus food!"
                : `Order Status: ${order.status.toUpperCase()}`
             }
          </p>

          {order.status === 'confirmed' ? (
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 max-w-sm mx-auto">
               <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Collection Code</p>
               <div className="text-4xl font-black text-slate-900 tracking-[0.2em] font-mono select-all">
                 {order.collectionCode}
               </div>
             </div>
          ) : order.status === 'reserved' ? (
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 max-w-sm mx-auto">
               <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Collection Code</p>
               <div className="text-lg font-bold text-amber-500 animate-pulse">
                Awaiting Payment Confirmation...
                <p className="text-xs font-normal text-slate-500 mt-2">Refresh the page in a few seconds.</p>
               </div>
             </div>
          ) : null}

          <div className="text-left bg-white border border-slate-100 p-6 rounded-2xl shadow-sm mb-8 space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Pickup Details</h3>
            
            <div className="flex items-start gap-3">
              <ShoppingBag className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">1x Surprise Bag • £{order.totalPrice.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">{store.name}</p>
                <p className="text-sm text-slate-500">{store.address}</p>
                <p className="text-sm font-medium text-amber-600 mt-1">
                  Collect before: {new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hour12: true }).format(item.pickupEnd)}
                </p>
              </div>
            </div>

            {order.status === 'confirmed' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <a href={createCalendarUrl(item, store)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">
                  <Calendar className="w-5 h-5 text-indigo-500" /> Add to Google Calendar
                </a>
              </div>
            )}
          </div>

          {/* Rating Section */}
          {order.status === 'collected' && (
             <div className="mt-8">
                {order.rating ? (
                   <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-left">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= order.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <p className="font-bold text-slate-900">You rated this experience</p>
                      {order.ratingComment && (
                        <p className="text-sm text-slate-600 mt-2 italic">"{order.ratingComment}"</p>
                      )}
                   </div>
                ) : (
                   <RatingForm orderId={order._id.toString()} />
                )}
             </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
             <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
               <Link href="/dashboard/customer">Discover More</Link>
             </Button>
             <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
               <Link href="/dashboard/customer/orders">View All Orders</Link>
             </Button>
          </div>
       </div>
    </div>
  );
}

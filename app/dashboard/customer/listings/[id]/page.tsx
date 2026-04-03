import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import FoodItem from "@/models/FoodItem";
import Store from "@/models/Store";
import { redirect } from "next/navigation";
import { MapPin, Clock, Tag, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "customer") redirect("/auth/login");

  await dbConnect();

  const item = await FoodItem.findById(params.id).populate({
     path: 'storeId',
     model: Store
  });

  if (!item) {
     return <div className="p-8 text-center text-slate-500">Listing not found.</div>;
  }

  const isExpired = new Date() > item.expiresAt;
  const isSoldOut = item.quantityRemaining <= 0;
  
  // @ts-ignore
  const store = item.storeId;
  const discountPercent = Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100);

  const formatTime = (d: Date) => {
    return new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hour12: true }).format(d);
  };
  const formatDate = (d: Date) => {
    return new Intl.DateTimeFormat('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto mb-20">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3 text-slate-500 hover:text-slate-900">
        <Link href="/dashboard/customer"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Feed</Link>
      </Button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Image */}
        <div className="w-full md:w-5/12 aspect-square relative bg-slate-100 flex items-center justify-center">
           {item.imageUrl ? (
             <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
           ) : (
             <span className="text-slate-400 capitalize text-lg">{item.category} Image</span>
           )}
           <div className="absolute top-4 left-4 bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-full shadow-md text-sm">
             {discountPercent}% OFF
           </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between">
           <div>
              <div className="flex justify-between items-start">
                 <div>
                   <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1 block">
                     {item.category}
                   </span>
                   <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                     {item.name}
                   </h1>
                 </div>
                 
                 <div className="text-right flex flex-col items-end pl-4">
                   <span className="text-2xl font-black text-emerald-600">£{item.discountedPrice.toFixed(2)}</span>
                   <span className="text-sm text-slate-400 line-through">£{item.originalPrice.toFixed(2)}</span>
                 </div>
              </div>

              <div className="mt-8 space-y-5">
                 <div className="flex gap-3 items-start">
                   <div className="bg-slate-100 p-2 rounded-lg mt-0.5"><MapPin className="w-5 h-5 text-slate-600" /></div>
                   <div>
                     <p className="font-semibold text-slate-900">{store.name}</p>
                     <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{store.address}</p>
                   </div>
                 </div>

                 <div className="flex gap-3 items-start">
                   <div className="bg-slate-100 p-2 rounded-lg mt-0.5"><Clock className="w-5 h-5 text-slate-600" /></div>
                   <div>
                     <p className="font-semibold text-slate-900">Pickup Window</p>
                     <p className="text-sm text-slate-600 mt-0.5">
                       {formatDate(item.pickupStart)} • {formatTime(item.pickupStart)} to {formatTime(item.pickupEnd)}
                     </p>
                   </div>
                 </div>

                 <div className="flex gap-3 items-start">
                   <div className="bg-slate-100 p-2 rounded-lg mt-0.5"><Tag className="w-5 h-5 text-slate-600" /></div>
                   <div>
                     <p className="font-semibold text-slate-900">Quantity Remaining</p>
                     <p className="text-sm text-slate-600 mt-0.5">
                       {item.quantityRemaining} bags available
                     </p>
                   </div>
                 </div>
              </div>
           </div>

           <div className="mt-10 pt-6 border-t border-slate-100">
             {isExpired ? (
               <Button className="w-full" size="lg" disabled variant="secondary">
                 Listing Expired
               </Button>
             ) : isSoldOut ? (
               <Button className="w-full" size="lg" disabled variant="secondary">
                 Sold Out
               </Button>
             ) : (
               <form action="/dashboard/customer/orders/checkout" method="POST">
                 <input type="hidden" name="itemId" value={item._id.toString()} />
                 <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg shadow-md" size="lg">
                   <ShoppingBag className="w-5 h-5 mr-2" />
                   Reserve Now
                 </Button>
                 <p className="text-center text-xs text-slate-500 mt-3">
                   Reservations are held for 10 minutes to complete checkout.
                 </p>
               </form>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import FoodItem from "@/models/FoodItem";
import Store from "@/models/Store";
import ReprocessorRequest from "@/models/ReprocessorRequest";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Truck } from "lucide-react";
import { requestCollectionAction } from "./actions";

export default async function ReprocessorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "reprocessor") redirect("/auth/login");

  await dbConnect();

  // Find items that are either marked 'expired' OR their expiresAt time has passed
  // and they still have quantity remaining.
  const expiredItems = await FoodItem.find({
     quantityRemaining: { $gt: 0 },
     $or: [
        { status: 'expired' },
        { expiresAt: { $lt: new Date() }, status: 'active' }
     ]
  }).populate({ path: 'storeId', model: Store }).sort({ expiresAt: -1 });

  // Get current user's requests to show status
  const userRequests = await ReprocessorRequest.find({ 
     userId: (session.user as any).id,
     status: 'requested'
  }).select('foodItemId');
  
  const requestedItemIds = new Set(userRequests.map(r => r.foodItemId.toString()));

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available for Collection</h1>
        <p className="mt-2 text-slate-600">
          These items have passed their sell-by window. Rescue them for composting or community aid.
        </p>
      </div>

      {expiredItems.length === 0 ? (
         <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No expired food available</h3>
            <p className="text-slate-500 mt-2">Check back later when businesses close for the day.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expiredItems.map((item) => {
             // @ts-ignore
             const store = item.storeId;
             
             return (
               <div key={item._id.toString()} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-emerald-200">
                  <div className="p-5 border-b border-slate-100 flex-1">
                     <div className="flex justify-between items-start mb-3">
                       <div>
                         <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-1 rounded inline-block mb-2">Expired</span>
                         <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.name}</h3>
                       </div>
                       <div className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg text-sm">
                         {item.quantityRemaining} bags
                       </div>
                     </div>
                     
                     <div className="space-y-2 mt-4">
                       <div className="flex items-start gap-2 text-sm text-slate-600">
                         <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                         <span className="leading-snug">
                           <strong className="text-slate-800 block">{store.name}</strong>
                           {store.address}
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-slate-600">
                         <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                         <span>Expired: {new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric' }).format(item.expiresAt)}</span>
                       </div>
                     </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 mt-auto">
                     {requestedItemIds.has(item._id.toString()) ? (
                        <Button disabled className="w-full bg-slate-200 text-slate-500 cursor-not-allowed">
                           <Clock className="w-4 h-4 mr-2" /> Requested
                        </Button>
                     ) : (
                       <form action={requestCollectionAction.bind(null, item._id.toString(), item.quantityRemaining)}>
                          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl">
                            <Truck className="w-4 h-4 mr-2" /> Request All Collection
                          </Button>
                       </form>
                     )}
                  </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
}

// Ensure Leaf icon is available if it was missing in the empty state
import { Leaf } from "lucide-react";

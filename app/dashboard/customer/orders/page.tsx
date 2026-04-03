import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import FoodItem from "@/models/FoodItem";
import Store from "@/models/Store";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "customer") redirect("/auth/login");

  await dbConnect();

  const orders = await Order.find({ userId: (session.user as any).id })
    .sort({ createdAt: -1 })
    .populate({ path: 'foodItemId', model: FoodItem })
    .populate({ path: 'storeId', model: Store });

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 mb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Orders</h1>
        <p className="mt-2 text-slate-600">
          Track your active reservations and past collections.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">No orders yet</h3>
          <p className="text-slate-500 mt-2 mb-6">You haven't rescued any food yet. Be the first!</p>
          <Button asChild>
            <Link href="/dashboard/customer">Browse Food Feed</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
             // @ts-ignore
             const item = order.foodItemId;
             // @ts-ignore
             const store = order.storeId;
             
             // handle possible deleted items or stores gracefully
             if (!item || !store) return null;

             const isActive = order.status === 'confirmed';

             return (
               <Link key={order._id.toString()} href={`/dashboard/customer/orders/${order._id.toString()}`} className={`block bg-white p-6 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] ${isActive ? 'border-emerald-200 shadow-md shadow-emerald-500/5' : 'border-slate-200 opacity-75'}`}>
                 <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                         <h3 className="text-lg font-bold text-slate-900">{store.name}</h3>
                         <Badge variant={
                           order.status === 'confirmed' ? 'default' : 
                           order.status === 'reserved' ? 'outline' :
                           order.status === 'collected' ? 'secondary' : 'destructive'
                         } className={order.status === 'reserved' ? 'border-amber-200 text-amber-700 bg-amber-50' : ''}>
                           {order.status === 'reserved' ? 'Awaiting Payment' : order.status}
                         </Badge>
                       </div>
                       
                       <p className="text-slate-600 font-medium">{item.name}</p>
                       <p className="text-sm text-slate-500 mt-1">
                         Status: {order.status === 'confirmed' ? 'Ready for Pickup' : order.status} • Total: £{order.totalPrice.toFixed(2)}
                       </p>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col items-center sm:items-end justify-center bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Collection Code</p>
                       {order.status === 'confirmed' || order.status === 'collected' ? (
                          <div className={`text-2xl font-mono font-black tracking-widest ${order.status === 'collected' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                             {order.collectionCode || "ERROR"}
                          </div>
                       ) : (
                          <div className="text-sm font-medium text-slate-400">—</div>
                       )}
                    </div>
                 </div>
               </Link>
             );
          })}
        </div>
      )}
    </div>
  );
}

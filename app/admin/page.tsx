import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import Order from "@/models/Order";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Building2, ShoppingBag, Leaf, Globe } from "lucide-react";
import { verifyBusinessAction, rejectBusinessAction } from "./actions";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "admin") {
    redirect("/auth/login");
  }

  await dbConnect();

  // Find all unverified business users
  const pendingBusinesses = await User.find({ role: 'business', isVerified: false })
    .sort({ createdAt: -1 })
    .lean();

  // Try to find if they've already submitted a Store profile
  const userIds = pendingBusinesses.map(b => b._id.toString());
  const stores = await Store.find({ userId: { $in: userIds } }).lean();
  
  const storesByUserId = Object.fromEntries(
     stores.map(store => [store.userId.toString(), store])
  );

  // Platform Stats
  const totalOrders = await Order.countDocuments({ status: { $in: ['confirmed', 'collected'] } });
  const collectedOrders = await Order.find({ status: 'collected' }).select('quantity');
  const totalFoodSaved = collectedOrders.reduce((acc, curr) => acc + curr.quantity, 0);
  const co2Avoided = (totalFoodSaved * 2.5).toFixed(1); // 2.5kg CO2 per kg food saved average
  const totalStores = await Store.countDocuments({ verificationStatus: 'approved' });

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Orders</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalOrders}</p>
          <p className="text-xs text-slate-400 mt-2">Across all {totalStores} verified stores</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Food Saved</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalFoodSaved} Kg</p>
          <p className="text-xs text-slate-400 mt-2">Perfectly good food rescued</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">CO₂ Avoided</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{co2Avoided} Kg</p>
          <p className="text-xs text-slate-400 mt-2">Estimated carbon footprint reduced</p>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Verifications</h1>
        <p className="mt-2 text-slate-600">
          Review and approve new partners wanting to list surplus food.
        </p>
      </div>

      {pendingBusinesses.length === 0 ? (
         <div className="text-center p-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500 mt-2">There are no pending business verifications presently.</p>
         </div>
      ) : (
         <div className="grid gap-6">
           {pendingBusinesses.map((bUser) => {
              const store = storesByUserId[bUser._id.toString()];
              
              return (
                 <div key={bUser._id.toString()} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                       <div className="flex items-center gap-2 mb-2">
                         <h3 className="text-lg font-bold text-slate-900">
                           {store ? store.name : "Unclaimed Store Name"}
                         </h3>
                         <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                           Pending
                         </span>
                       </div>
                       
                       <p className="text-slate-600 font-medium">{bUser.email}</p>
                       
                       {store ? (
                          <div className="text-sm text-slate-500 mt-2 space-y-1">
                             <p>Category: <span className="capitalize">{store.category}</span></p>
                             <p>Address: {store.address}</p>
                             <p>Phone: {bUser.phone || "N/A"}</p>
                          </div>
                       ) : (
                          <p className="text-sm text-slate-400 mt-2 italic">User has not created a Store profile yet.</p>
                       )}
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                       <form action={verifyBusinessAction.bind(null, bUser._id.toString())} className="flex-1 md:flex-none">
                         <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20">
                           <Check className="w-4 h-4 mr-2" /> Approve
                         </Button>
                       </form>
                       <form action={rejectBusinessAction.bind(null, bUser._id.toString())} className="flex-1 md:flex-none">
                         <Button type="submit" variant="outline" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                           <X className="w-4 h-4 mr-2" /> Reject
                         </Button>
                       </form>
                    </div>
                 </div>
              );
           })}
         </div>
      )}
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import ReprocessorRequest from "@/models/ReprocessorRequest";
import FoodItem from "@/models/FoodItem";
import Store from "@/models/Store";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { History, MapPin } from "lucide-react";

export default async function ReprocessorRequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "reprocessor") redirect("/auth/login");

  await dbConnect();

  const requests = await ReprocessorRequest.find({ userId: (session.user as any).id })
    .sort({ createdAt: -1 })
    .populate({ 
       path: 'foodItemId', 
       model: FoodItem,
       populate: { path: 'storeId', model: Store }
    });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Collections</h1>
        <p className="mt-2 text-slate-600">
          History of surplus items you have requested to collect.
        </p>
      </div>

      {requests.length === 0 ? (
         <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No history yet</h3>
            <p className="text-slate-500 mt-2">Any collections you request will appear here.</p>
         </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Item & Store</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Date Requested</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  // @ts-ignore
                  const item = req.foodItemId;
                  if (!item) return null;
                  
                  // @ts-ignore
                  const store = item.storeId;

                  return (
                    <tr key={req._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 align-top max-w-[250px]">
                         <span className="font-bold text-slate-900 block">{item.name}</span>
                         <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                           <MapPin className="w-3 h-3 shrink-0" />
                           {store ? store.name : 'Unknown Store'}
                         </span>
                      </td>
                      <td className="p-4 align-top font-mono font-medium text-slate-700">
                         {req.quantity} bags
                      </td>
                      <td className="p-4 align-top text-sm text-slate-600">
                         {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 align-top">
                         <Badge variant={req.status === 'requested' ? 'default' : 'secondary'} className={req.status === 'requested' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' : ''}>
                            {req.status}
                         </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

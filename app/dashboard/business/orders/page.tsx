import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import Order from "@/models/Order";
import FoodItem from "@/models/FoodItem";
import ReprocessorRequest from "@/models/ReprocessorRequest";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { markCollectedAction, markReprocessorCollectedAction } from "./actions";
import { Button } from "@/components/ui/button";

export default async function BusinessOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });

  if (!store || store.verificationStatus !== "approved") {
    redirect("/dashboard/business");
  }

  // Get all food items for this store
  const items = await FoodItem.find({ storeId: store._id }).select('_id name');
  const itemIds = items.map(i => i._id);
  const itemDict = items.reduce((acc, val) => {
    acc[val._id.toString()] = val.name;
    return acc;
  }, {} as Record<string, string>);

  // Find orders for these food items
  const orders = await Order.find({ foodItemId: { $in: itemIds } }).sort({ createdAt: -1 }).populate('userId', 'email phone');

  // Find reprocessor requests for these food items
  const reprocessorRequests = await ReprocessorRequest.find({ foodItemId: { $in: itemIds } })
    .sort({ createdAt: -1 })
    .populate('userId', 'email');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customer Orders</h1>
        <p className="mt-2 text-slate-600">
          View incoming orders and verify collections securely.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500">
             You have no orders yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const isConfirmed = order.status === 'confirmed';
                const isCollected = order.status === 'collected';
                const isCancelled = order.status === 'cancelled';
                
                return (
                  <TableRow key={order._id.toString()}>
                    <TableCell className="font-medium">
                       {/* @ts-ignore - populated field */}
                       {order.userId?.email}
                    </TableCell>
                    <TableCell>{itemDict[order.foodItemId.toString()]}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>£{order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-800 tracking-wider">
                         {order.collectionCode || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                       <Badge variant={isConfirmed ? "default" : isCancelled ? "destructive" : "secondary"}>
                         {order.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {isConfirmed && (
                         <form action={markCollectedAction.bind(null, order._id.toString())}>
                            <Button size="sm" type="submit" variant="default" className="bg-emerald-600 hover:bg-emerald-700">Mark Collected</Button>
                         </form>
                       )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="pt-8">
        <h1 className="text-3xl font-bold text-slate-900">Reprocessor Pickups</h1>
        <p className="mt-2 text-slate-600">
          Verify and confirm food items collected by reprocessors for composting or aid.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {reprocessorRequests.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500">
             No reprocessor requests yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reprocessor</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reprocessorRequests.map((req) => {
                const isRequested = req.status === 'requested';
                return (
                  <TableRow key={req._id.toString()}>
                    <TableCell className="font-medium">
                       {/* @ts-ignore - populated field */}
                       {req.userId?.email || "Unknown"}
                    </TableCell>
                    <TableCell>{itemDict[req.foodItemId.toString()]}</TableCell>
                    <TableCell>{req.quantity} bags</TableCell>
                    <TableCell>
                       {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                       <Badge variant={isRequested ? "default" : "secondary"}>
                         {req.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {isRequested && (
                         <form action={markReprocessorCollectedAction.bind(null, req._id.toString())}>
                            <Button size="sm" type="submit" variant="default" className="bg-amber-600 hover:bg-amber-700">Confirm Pickup</Button>
                         </form>
                       )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

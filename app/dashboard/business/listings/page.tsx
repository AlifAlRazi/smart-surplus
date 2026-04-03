import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import FoodItem from "@/models/FoodItem";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { deleteListingAction, markSoldOutAction } from "./actions";

export default async function ListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });

  if (!store || store.verificationStatus !== "approved") {
    redirect("/dashboard/business");
  }

  const listings = await FoodItem.find({ storeId: store._id }).sort({ createdAt: -1 });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Listings</h1>
          <p className="mt-2 text-slate-600">
            Manage your active, expired, and closed food listings.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/business/listings/new">New Listing</Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {listings.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500">
             No listings found. Create your first listing to start reducing waste!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((item) => {
                const isSoldOut = item.quantityRemaining === 0;
                return (
                  <TableRow key={item._id.toString()}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>£{item.discountedPrice.toFixed(2)}</TableCell>
                    <TableCell>{item.quantityRemaining} / {item.quantity}</TableCell>
                    <TableCell>
                       <Badge variant={item.status === 'active' && !isSoldOut ? 'default' : 'secondary'}>
                         {isSoldOut ? 'Sold Out' : item.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         {item.status === 'active' && !isSoldOut && (
                            <form action={markSoldOutAction.bind(null, item._id.toString())}>
                              <Button variant="outline" size="sm" type="submit">Sold Out</Button>
                            </form>
                         )}
                         <form action={deleteListingAction.bind(null, item._id.toString())}>
                            <Button variant="destructive" size="sm" type="submit">Delete</Button>
                         </form>
                       </div>
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

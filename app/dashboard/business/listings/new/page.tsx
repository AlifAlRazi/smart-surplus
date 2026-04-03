import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import { redirect } from "next/navigation";
import { createListingAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });

  if (!store || store.verificationStatus !== "approved") {
    redirect("/dashboard/business");
  }

  // Pre-fill some standard times for pickup and expiry
  const now = new Date();
  
  // Default pickup starts now, ends in 4 hours
  const defaultPickupStart = new Date(now).toISOString().slice(0, 16); // YYYY-MM-DDThh:mm format
  const endDefault = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const defaultPickupEnd = endDefault.toISOString().slice(0, 16);
  
  // Expiry is equal to pickup end by default
  const defaultExpiry = defaultPickupEnd;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
           <Link href="/dashboard/business/listings"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create New Listing</h1>
          <p className="mt-2 text-slate-600">
            List surplus food at a discounted rate to prevent waste.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <form action={createListingAction} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2">
               <Label htmlFor="name">Item Name / Title</Label>
               <Input id="name" name="name" placeholder="e.g. Mystery Bag, Surplus Pastries" required />
            </div>

            <div className="space-y-2">
               <Label htmlFor="category">Category</Label>
               <Select name="category" defaultValue="groceries">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="bakery">Bakery / Cafe</SelectItem>
                    <SelectItem value="meals">Prepared Meals</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
               </Select>
            </div>

            <div className="space-y-2">
               <Label htmlFor="quantity">Quantity Available</Label>
               <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
            </div>

            <div className="space-y-2">
               <Label htmlFor="originalPrice">Original Price (£)</Label>
               <Input id="originalPrice" name="originalPrice" type="number" step="0.01" min="0" placeholder="10.00" required />
            </div>

            <div className="space-y-2">
               <Label htmlFor="discountedPrice">Discounted Price (£)</Label>
               <p className="text-[10px] text-slate-500 relative -top-1">We recommend at least 50% off</p>
               <Input id="discountedPrice" name="discountedPrice" type="number" step="0.01" min="0" placeholder="3.50" required />
            </div>

            <div className="space-y-2">
               <Label htmlFor="pickupStart">Pickup Window Starts</Label>
               <Input id="pickupStart" name="pickupStart" type="datetime-local" defaultValue={defaultPickupStart} required />
            </div>

            <div className="space-y-2">
               <Label htmlFor="pickupEnd">Pickup Window Ends</Label>
               <Input id="pickupEnd" name="pickupEnd" type="datetime-local" defaultValue={defaultPickupEnd} required />
            </div>

            <div className="space-y-2 sm:col-span-2">
               <Label htmlFor="expiresAt">Listing Expiry Time</Label>
               <p className="text-xs text-slate-500">
                 When does this food become "expired" (e.g. unsellable to customers and passes to Reprocessors)?
               </p>
               <Input id="expiresAt" name="expiresAt" type="datetime-local" defaultValue={defaultExpiry} required />
            </div>

            <div className="space-y-2 sm:col-span-2">
               <Label htmlFor="imageUrl">Thumbnail Image URL</Label>
               <p className="text-xs text-slate-500">Provide an image link. Uploading functionality coming soon.</p>
               <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://..." />
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">Create Food Listing</Button>
        </form>
      </div>
    </div>
  );
}

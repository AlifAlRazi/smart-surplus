import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import { saveStoreAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { redirect } from "next/navigation";

export default async function StoreProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });

  if (!store) {
    return <div>Store not found</div>;
  }

  // Passing data to Client Component form could be done via props, but we're doing a simple Server Component with a form action.
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Store Profile</h1>
        <p className="mt-2 text-slate-600">
          Update your business details so customers know where to collect their food.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <form action={saveStoreAction} className="space-y-6">
          <div className="space-y-2">
             <Label htmlFor="name">Business Name</Label>
             <Input id="name" name="name" defaultValue={store.name || ""} required />
          </div>

          <div className="space-y-2">
             <Label htmlFor="category">Category</Label>
             <Select name="category" defaultValue={store.category || "restaurant"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="bakery">Bakery / Cafe</SelectItem>
                  <SelectItem value="supermarket">Grocery / Supermarket</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
             </Select>
          </div>

          <div className="space-y-2">
             <Label htmlFor="address">Full Address</Label>
             <p className="text-xs text-slate-500">
               Please provide a full, accurate address so we can locate you on the map.
             </p>
             <Input id="address" name="address" defaultValue={store.address || ""} placeholder="e.g. 123 Main St, London, UK" required />
          </div>

          <div className="space-y-2">
             <Label htmlFor="logoUrl">Logo Image URL</Label>
             <p className="text-xs text-slate-500">
               Provide a public URL to your business logo for now (Cloudinary direct upload can be added here).
             </p>
             <Input id="logoUrl" name="logoUrl" type="url" defaultValue={store.logoUrl || ""} placeholder="https://..." />
          </div>

          <Button type="submit" className="w-full sm:w-auto">Save Profile changes</Button>
        </form>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import FoodItem from "@/models/FoodItem";
import { redirect } from "next/navigation";
import { StoreMap } from "@/components/store-map";

export default async function CustomerMapPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "customer") {
    redirect("/auth/login");
  }

  await dbConnect();

  // Find all active food items to see which stores actually have food
  const activeItems = await FoodItem.find({
    status: 'active',
    quantityRemaining: { $gt: 0 },
    expiresAt: { $gt: new Date() }
  }).select('storeId');

  // Group by store
  const storeCounts: Record<string, number> = {};
  activeItems.forEach(item => {
     const id = item.storeId.toString();
     storeCounts[id] = (storeCounts[id] || 0) + 1;
  });

  const storeIds = Object.keys(storeCounts);

  // Fetch only stores that have active items and have lat/lng set
  const stores = await Store.find({
    _id: { $in: storeIds },
    lat: { $exists: true, $ne: 0 },
    lng: { $exists: true, $ne: 0 }
  });

  const mapStores = stores.map(store => ({
     id: store._id.toString(),
     name: store.name || 'Store',
     category: store.category || '',
     lat: store.lat!,
     lng: store.lng!,
     itemCount: storeCounts[store._id.toString()]
  }));

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
       <div className="p-8 max-w-2xl mx-auto text-center mt-12 bg-white rounded-xl border border-dashed border-slate-300">
         <h2 className="text-xl font-bold text-slate-800">Map Not Configured</h2>
         <p className="text-slate-500 mt-2">
           Please add your `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local` to enable the interactive map feature.
         </p>
       </div>
    );
  }

  return (
    <div className="w-full relative">
       {/* Full bleed map wrapping behind standard margins by absolute positioning inside full w wrapper */}
       <StoreMap stores={mapStores} mapboxToken={token} />
    </div>
  );
}

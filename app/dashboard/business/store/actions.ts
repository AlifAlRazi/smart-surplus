'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveStoreAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "business") {
     throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const address = formData.get("address") as string;
  const logoUrl = formData.get("logoUrl") as string;

  if (!name || !category || !address) {
     throw new Error("Name, Category, and Address are required");
  }

  // Extremely basic Geocoding fallback - using Mapbox
  let lat = 0;
  let lng = 0;
  
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (mapboxToken && mapboxToken.startsWith('pk.')) {
     try {
       const geocodeRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1`);
       const geocodeData = await geocodeRes.json();
       if (geocodeData.features && geocodeData.features.length > 0) {
          const coords = geocodeData.features[0].center; // [lng, lat]
          lng = coords[0];
          lat = coords[1];
       }
     } catch (e) {
       console.error("Geocoding failed:", e);
     }
  }

  await dbConnect();
  await Store.findOneAndUpdate(
    { userId: (session.user as any).id },
    {
      name,
      category,
      address,
      logoUrl: logoUrl || undefined,
      ...(lat !== 0 && lng !== 0 && { lat, lng })
    }
  );

  revalidatePath("/dashboard/business/store");
  revalidatePath("/dashboard/business");
  redirect("/dashboard/business");
}

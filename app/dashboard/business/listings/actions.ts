'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import FoodItem from "@/models/FoodItem";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createListingAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "business") {
     throw new Error("Unauthorized");
  }

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });

  if (!store || store.verificationStatus !== "approved") {
     throw new Error("Store is not verified");
  }

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const originalPrice = parseFloat(formData.get("originalPrice") as string);
  const discountedPrice = parseFloat(formData.get("discountedPrice") as string);
  const pickupStart = new Date(formData.get("pickupStart") as string);
  const pickupEnd = new Date(formData.get("pickupEnd") as string);
  const expiresAt = new Date(formData.get("expiresAt") as string);
  const imageUrl = formData.get("imageUrl") as string;

  if (!name || isNaN(quantity) || isNaN(originalPrice) || isNaN(discountedPrice)) {
     throw new Error("Missing required numeric fields");
  }

  await FoodItem.create({
    storeId: store._id,
    name,
    category,
    quantity,
    quantityRemaining: quantity,
    originalPrice,
    discountedPrice,
    pickupStart,
    pickupEnd,
    expiresAt,
    status: 'active',
    imageUrl: imageUrl || undefined
  });

  revalidatePath("/dashboard/business/listings");
  revalidatePath("/dashboard/customer"); // invalidate public feed
  redirect("/dashboard/business/listings");
}

export async function deleteListingAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "business") throw new Error("Unauthorized");

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });
  
  // ensure listing belongs to store
  const item = await FoodItem.findOne({ _id: id, storeId: store._id });
  if (!item) throw new Error("Listing not found");

  await FoodItem.deleteOne({ _id: id });
  
  revalidatePath("/dashboard/business/listings");
  revalidatePath("/dashboard/customer");
}

export async function markSoldOutAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "business") throw new Error("Unauthorized");

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });
  
  // ensure listing belongs to store
  const item = await FoodItem.findOne({ _id: id, storeId: store._id });
  if (!item) throw new Error("Listing not found");

  item.status = "done";
  item.quantityRemaining = 0;
  await item.save();
  
  revalidatePath("/dashboard/business/listings");
  revalidatePath("/dashboard/customer");
}

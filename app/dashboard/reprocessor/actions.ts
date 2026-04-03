'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import FoodItem from "@/models/FoodItem";
import ReprocessorRequest from "@/models/ReprocessorRequest";
import { revalidatePath } from "next/cache";

export async function requestCollectionAction(foodItemId: string, quantityToCollect: number) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "reprocessor") {
     throw new Error("Unauthorized");
  }

  await dbConnect();

  const item = await FoodItem.findById(foodItemId);
  if (!item) throw new Error("Food item not found");

  if (item.quantityRemaining < quantityToCollect) {
     throw new Error("Cannot request more than remaining quantity");
  }

  // Deduct quantity and change status if it hits 0
  item.quantityRemaining -= quantityToCollect;
  if (item.quantityRemaining <= 0) {
     item.status = "reprocessing";
  }
  
  await item.save();

  // Create the request
  await ReprocessorRequest.create({
    userId: (session.user as any).id,
    foodItemId: item._id,
    quantity: quantityToCollect,
    status: 'requested'
  });

  revalidatePath("/dashboard/reprocessor");
  revalidatePath("/dashboard/reprocessor/requests");
}

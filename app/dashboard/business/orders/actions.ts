'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import Order from "@/models/Order";
import FoodItem from "@/models/FoodItem";
import ReprocessorRequest from "@/models/ReprocessorRequest";
import { revalidatePath } from "next/cache";

export async function markCollectedAction(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "business") {
     throw new Error("Unauthorized");
  }

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });
  
  if (!store || store.verificationStatus !== "approved") {
     throw new Error("Store is not verified");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  // Verify the order belongs to a food item from this store
  const foodItem = await FoodItem.findOne({ _id: order.foodItemId, storeId: store._id });
  if (!foodItem) {
     throw new Error("Unauthorized access to this order");
  }

  if (order.status !== 'confirmed') {
     throw new Error("Order is not ready for collection");
  }

  order.status = 'collected';
  await order.save();

  revalidatePath("/dashboard/business/orders");
}

export async function markReprocessorCollectedAction(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "business") {
     throw new Error("Unauthorized");
  }

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });
  
  if (!store || store.verificationStatus !== "approved") {
     throw new Error("Store is not verified");
  }

  const request = await ReprocessorRequest.findById(requestId);
  if (!request) throw new Error("Reprocessor request not found");

  // Verify the request belongs to a food item from this store
  const foodItem = await FoodItem.findOne({ _id: request.foodItemId, storeId: store._id });
  if (!foodItem) {
     throw new Error("Unauthorized access to this request");
  }

  if (request.status !== 'requested') {
     throw new Error("Request is not in a 'requested' state");
  }

  request.status = 'collected';
  await request.save();

  // Optionally mark the food item as 'done' if no quantity remains
  if (foodItem.quantityRemaining === 0) {
     foodItem.status = 'done';
     await foodItem.save();
  }

  revalidatePath("/dashboard/business/orders");
}

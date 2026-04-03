'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { revalidatePath } from "next/cache";

export async function submitRatingAction(orderId: string, rating: number, comment: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "customer") {
    throw new Error("Unauthorized");
  }

  await dbConnect();

  const order = await Order.findById(orderId);
  if (!order || order.userId.toString() !== (session.user as any).id) {
    throw new Error("Order not found or unauthorized");
  }

  if (order.status !== 'collected') {
    throw new Error("You can only rate collected orders");
  }

  if (order.rating) {
    throw new Error("You have already rated this order");
  }

  order.rating = rating;
  order.ratingComment = comment;
  await order.save();

  revalidatePath(`/dashboard/customer/orders/${orderId}`);
  revalidatePath('/dashboard/customer/orders');
}

'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function verifyBusinessAction(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
     throw new Error("Unauthorized");
  }

  await dbConnect();

  const user = await User.findById(userId);
  if (!user || user.role !== 'business') {
     throw new Error("Invalid request");
  }

  user.isVerified = true;
  await user.save();

  revalidatePath("/admin");
}

export async function rejectBusinessAction(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
     throw new Error("Unauthorized");
  }

  await dbConnect();
  
  // Actually rejecting could just delete them or flag them.
  // We'll just delete the unverified business account to force re-registration or keep the database clean
  await User.findByIdAndDelete(userId);

  revalidatePath("/admin");
}

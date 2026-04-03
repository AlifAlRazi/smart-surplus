import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BusinessDashboard() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  
  const store = await Store.findOne({ userId: (session?.user as any).id });

  if (!store) return null;

  const isPending = store.verificationStatus === "pending";
  const isRejected = store.verificationStatus === "rejected";
  const isApproved = store.verificationStatus === "approved";

  const needsProfileSetup = !store.name || !store.address || !store.category;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="mt-2 text-slate-600">
          Welcome to your Smart Surplus business partner portal.
        </p>
      </div>

      {needsProfileSetup && (
        <div className="bg-amber-50 border left-4 border-amber-200 p-6 rounded-xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-amber-900">Complete your Store Profile</h3>
            <p className="text-amber-700 mt-1 text-sm">
              You must fill out your store details (name, category, address) before we can verify your account.
            </p>
            <Button asChild className="mt-4 bg-amber-600 hover:bg-amber-700">
              <Link href="/dashboard/business/store">Set up profile</Link>
            </Button>
          </div>
        </div>
      )}

      {isPending && !needsProfileSetup && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-start gap-4">
           <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
           <div>
             <h3 className="font-semibold text-blue-900">Verification Pending</h3>
             <p className="text-blue-700 mt-1 text-sm">
               Your profile has been submitted for review. An admin (Food Safety Officer) will review your application shortly. Once approved, you can start listing surplus food.
             </p>
           </div>
        </div>
      )}

      {isRejected && (
         <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-start gap-4">
           <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
           <div>
             <h3 className="font-semibold text-red-900">Verification Rejected</h3>
             <p className="text-red-700 mt-1 text-sm">
               Your application was rejected. Please contact support or update your store profile details.
             </p>
             <Button asChild variant="outline" className="mt-4">
               <Link href="/dashboard/business/store">Update profile</Link>
             </Button>
           </div>
         </div>
      )}

      {isApproved && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
          <div className="w-full">
            <h3 className="font-semibold text-emerald-900">Account Verified</h3>
            <p className="text-emerald-700 mt-1 text-sm">
              You are ready to list food and accept orders.
            </p>
            <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
               <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Listings</p>
                 <p className="text-2xl font-bold text-slate-900 mt-2">0</p>
               </div>
               <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Orders</p>
                 <p className="text-2xl font-bold text-slate-900 mt-2">0</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

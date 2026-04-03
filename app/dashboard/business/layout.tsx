import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Store as StoreIcon, Package, ListChecks } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "business") {
    redirect("/auth/login");
  }

  await dbConnect();
  const store = await Store.findOne({ userId: (session.user as any).id });

  if (!store) {
    // Should not happen as store is created on signup, but safety first
    return <div>Store not found</div>;
  }

  const isApproved = store.verificationStatus === "approved";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <span className="text-lg font-bold text-slate-800">Smart Surplus</span>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            href="/dashboard/business"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100"
          >
            <StoreIcon className="w-5 h-5 text-slate-400" />
            Overview
          </Link>
          <Link
            href="/dashboard/business/store"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100"
          >
            <Package className="w-5 h-5 text-slate-400" />
            Store Profile
          </Link>

          {isApproved ? (
            <>
              <Link
                href="/dashboard/business/listings"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100"
              >
                <ListChecks className="w-5 h-5 text-slate-400" />
                Listings
              </Link>
              <Link
                href="/dashboard/business/orders"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100"
              >
                <Package className="w-5 h-5 text-slate-400" />
                Orders
              </Link>
            </>
          ) : (
             <div className="px-3 py-2 mt-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
               Finish verification to unlock listings & orders
             </div>
          )}

          <div className="mt-8">
            <SignOutButton variant="sidebar" />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

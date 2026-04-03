import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Leaf, History } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export default async function ReprocessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "reprocessor") {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard/reprocessor" className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <span className="text-xl font-bold text-white tracking-tight">
                  Reprocessor Portal
                </span>
              </Link>
              
              <nav className="hidden md:flex gap-6">
                <Link href="/dashboard/reprocessor" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <Leaf className="w-4 h-4" /> Available Food
                </Link>
                <Link href="/dashboard/reprocessor/requests" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <History className="w-4 h-4" /> My Collections
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
               <SignOutButton className="text-slate-400 hover:text-red-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-7xl">
        {children}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link href="/dashboard/reprocessor" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-emerald-400">
            <Leaf className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Available</span>
          </Link>
          <Link href="/dashboard/reprocessor/requests" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-emerald-400">
            <History className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

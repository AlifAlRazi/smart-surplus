import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, ArrowLeft, Users, Store, LineChart } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="text-xl font-bold text-white tracking-tight">
                  Admin Control
                </span>
              </Link>
              
              <nav className="hidden md:flex gap-6">
                 <Link href="/admin" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                   <Users className="w-4 h-4" /> Verifications
                 </Link>
                 {/* Placeholders for future pages */}
                 <span className="flex items-center gap-2 text-sm font-medium text-slate-500 cursor-not-allowed">
                   <Store className="w-4 h-4" /> Stores
                 </span>
                 <span className="flex items-center gap-2 text-sm font-medium text-slate-500 cursor-not-allowed">
                   <LineChart className="w-4 h-4" /> Analytics
                 </span>
              </nav>
            </div>

            <div className="flex items-center gap-4">
               <Link href="/api/auth/signout" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
                 <span>Sign Out</span>
                 <ArrowLeft className="w-4 h-4" />
               </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-7xl p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}

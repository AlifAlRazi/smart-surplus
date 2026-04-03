import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Map as MapIcon, ShoppingBag } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "customer") {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard/customer" className="flex items-center gap-2">
                <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">
                  Smart Surplus
                </span>
              </Link>
              
              <nav className="hidden md:flex gap-6">
                <Link href="/dashboard/customer" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                  <Home className="w-4 h-4" /> Feed
                </Link>
                <Link href="/dashboard/customer/map" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                  <MapIcon className="w-4 h-4" /> Map
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
               <Link href="/dashboard/customer/orders" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                 <ShoppingBag className="w-5 h-5" />
                 <span className="hidden sm:inline">Orders</span>
               </Link>
               
               <div className="w-px h-6 bg-slate-200 mx-2"></div>
               
               <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto max-w-7xl">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link href="/dashboard/customer" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-emerald-600">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Feed</span>
          </Link>
          <Link href="/dashboard/customer/map" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-emerald-600">
            <MapIcon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Map</span>
          </Link>
          <Link href="/dashboard/customer/orders" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-emerald-600">
            <ShoppingBag className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Leaf, MapPin, Store, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const dashboardUrl = userRole === 'admin' 
    ? '/admin' 
    : userRole 
      ? `/dashboard/${userRole}` 
      : null;

  const signupUrl = dashboardUrl || '/auth/signup?role=customer';
  const loginUrl = dashboardUrl || '/auth/login';
  const getStartedText = dashboardUrl ? 'Go to Dashboard' : 'Get Started';
  const loginText = dashboardUrl ? 'Dashboard' : 'Sign In';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200">
      {/* Glass Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent tracking-tight">
              Smart Surplus
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={loginUrl} className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition">
              {loginText}
            </Link>
            <Button asChild className="hidden sm:inline-flex bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 transition-opacity rounded-full px-6 shadow-md shadow-emerald-500/20">
              <Link href={signupUrl}>{getStartedText}</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-emerald-50/80 to-transparent -z-10" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[100px] mix-blend-multiply -z-10" />
        <div className="absolute top-20 -right-20 w-[600px] h-[600px] bg-teal-300/20 rounded-full blur-[100px] mix-blend-multiply -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            initial="initial" 
            animate="animate" 
            variants={stagger}
            className="text-center lg:text-left pt-10"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Fighting food waste globally
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Rescue food.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500">
                Save the planet.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="mt-6 text-lg lg:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connect with local restaurants, cafes, and bakeries to buy perfectly good surplus food at massive discounts. Eat well, spend less, and stop waste.
            </motion.p>
            
            <motion.div variants={fadeIn} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="h-14 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-base shadow-xl">
                <Link href={userRole === 'customer' ? '/dashboard/customer' : '/auth/signup?role=customer'}>
                  {userRole === 'customer' ? 'Browse Food' : 'Join as Customer'} <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-base bg-white">
                <Link href={userRole === 'business' ? '/dashboard/business' : '/auth/signup?role=business'}>
                  {userRole === 'business' ? 'My Store' : 'Register a Business'}
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Floating Elements / Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] hidden lg:block"
          >
            {/* Main Phone Graphic Frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[650px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden shadow-emerald-500/10">
               {/* Phone Screen Mockup */}
               <div className="w-full h-full bg-slate-50 flex flex-col relative">
                  <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl"></div>
                  
                  <div className="p-6 pt-12 space-y-4">
                    <div className="h-8 w-3/4 bg-slate-200 rounded-lg animate-pulse"></div>
                    <div className="flex gap-2">
                       <div className="h-8 w-20 bg-emerald-100 rounded-full"></div>
                       <div className="h-8 w-20 bg-slate-200 rounded-full"></div>
                    </div>
                    
                    {/* Fake Food Cards */}
                    {[1, 2].map(i => (
                      <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                        <div className="aspect-[4/3] bg-emerald-50 rounded-xl mb-3 flex items-center justify-center">
                           <ShoppingBag className="w-8 h-8 text-emerald-200" />
                        </div>
                        <div className="h-4 w-2/3 bg-slate-200 rounded mb-2"></div>
                        <div className="h-3 w-1/3 bg-emerald-100 rounded"></div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Floating Badges */}
            <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-20 -left-12 bg-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">10,000+ kg</p>
                <p className="text-xs text-slate-500">Food Rescued</p>
              </div>
            </motion.div>

            <motion.div 
               animate={{ y: [0, 20, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-40 -right-8 bg-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Store className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">500+ Local</p>
                <p className="text-xs text-slate-500">Partner Stores</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* How it Works Section */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">How Smart Surplus Works</h2>
            <p className="text-lg text-slate-600">A seamless three-sided marketplace designed to intervene at every stage of surplus.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center transition-colors hover:border-emerald-200"
            >
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 shadow-slate-200 text-emerald-600">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Stores List Surplus</h3>
              <p className="text-slate-600 leading-relaxed">Restaurants and cafes log into their portal to upload their unsold, perfectly good food at closing time.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 text-center transition-all bg-gradient-to-b from-emerald-50 to-teal-50 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-emerald-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Customers Reserve</h3>
              <p className="text-slate-600 leading-relaxed">Users browse the interactive map, reserve discounted "mystery bags" securely via Stripe, and pick them up before expiry.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center transition-colors hover:border-teal-200"
            >
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-teal-600">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Charities Collect</h3>
              <p className="text-slate-600 leading-relaxed">Our automated cron job flips unpurchased bags to "Expired", notifying food reprocessors to collect them for compost or aid.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Ready to start saving?</h2>
          <p className="text-xl text-slate-600 mb-10">Join thousands of others making an impact on their wallet and the planet.</p>
          <Button asChild size="lg" className="h-16 px-10 rounded-full bg-slate-900 hover:bg-slate-800 text-lg shadow-2xl shadow-slate-900/20">
            <Link href={signupUrl}>{dashboardUrl ? 'Get Started Now' : 'Join for Free Today'}</Link>
          </Button>
        </div>
        
        {/* Footnote */}
        <div className="absolute bottom-6 w-full text-center text-sm text-slate-500">
          Smart Surplus Prototype — 2026
        </div>
      </footer>
    </div>
  );
}

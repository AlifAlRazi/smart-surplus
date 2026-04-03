import dbConnect from "@/lib/mongodb";
import FoodItem from "@/models/FoodItem";
import Store from "@/models/Store";
import Order from "@/models/Order";
import { FoodCard } from "@/components/food-card";
import { Search, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function CustomerDashboard({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const session = await getServerSession(authOptions);
  await dbConnect();

  // Calculate Average Ratings per store
  // We fetch all rated orders, then aggregate.
  const ratedOrders = await Order.find({ rating: { $exists: true } })
    .select('foodItemId rating')
    .populate({ path: 'foodItemId', select: 'storeId', model: FoodItem });
  
  const storeRatings: Record<string, { total: number; count: number }> = {};
  
  ratedOrders.forEach(order => {
     // @ts-ignore
     const storeId = order.foodItemId?.storeId?.toString();
     if (storeId) {
        if (!storeRatings[storeId]) storeRatings[storeId] = { total: 0, count: 0 };
        storeRatings[storeId].total += order.rating || 0;
        storeRatings[storeId].count += 1;
     }
  });

  // Calculate Impact Stats
  const userId = (session?.user as any)?.id;
  const impactCount = userId ? await Order.countDocuments({
    userId: userId,
    status: { $in: ['confirmed', 'collected'] }
  }) : 0;
  // Estimate: 1 order = 1 meal = 1kg CO2e saved
  const kgSaved = (impactCount * 1.5).toFixed(1);

  // Basic search and filter query
  const query: any = { 
    status: 'active',
    quantityRemaining: { $gt: 0 },
    expiresAt: { $gt: new Date() } // only show unexpired items
  };

  if (searchParams.category && searchParams.category !== 'all') {
    query.category = searchParams.category;
  }
  
  if (searchParams.search) {
    query.name = { $regex: searchParams.search, $options: 'i' };
  }

  // Populate store to get the store name
  const items = await FoodItem.find(query)
    .sort({ expiresAt: 1 }) // items expiring sooner first
    .populate({
      path: 'storeId',
      model: Store,
      select: 'name'
    });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'groceries', label: 'Groceries' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'meals', label: 'Meals' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 pb-24 md:pb-8">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Discover Surplus Food</h1>
           <p className="text-slate-500 mt-1">Rescue delicious food before it expires.</p>
        </div>
        
        <form className="flex w-full md:w-auto items-center gap-2" method="GET">
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input 
               name="search"
               placeholder="Search food..." 
               className="pl-9 bg-white border-slate-200"
               defaultValue={searchParams.search || ''}
             />
           </div>
           {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
           <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      {/* Impact Banner */}
      {impactCount > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Your Impact Dashboard</h3>
              <p className="text-emerald-100 text-sm">Together we're making a difference.</p>
            </div>
          </div>
          <div className="flex gap-8">
             <div className="text-center">
                <div className="text-3xl font-black tracking-tight">{impactCount}</div>
                <div className="text-xs uppercase tracking-wider font-bold text-emerald-100 mt-1">Meals Saved</div>
             </div>
             <div className="text-center">
                <div className="text-3xl font-black tracking-tight">{kgSaved}</div>
                <div className="text-xs uppercase tracking-wider font-bold text-emerald-100 mt-1">Kg CO₂ Saved</div>
             </div>
          </div>
        </div>
      )}

      {/* Categories Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {categories.map(cat => {
            const isActive = searchParams.category === cat.id || (!searchParams.category && cat.id === 'all');
            return (
              <a 
                key={cat.id} 
                href={`?category=${cat.id}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                 {cat.label}
              </a>
            );
         })}
      </div>

      {/* Grid Feed */}
      {items.length === 0 ? (
         <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <h3 className="text-lg font-bold text-slate-900">No surplus food available right now.</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Check back later! Businesses usually upload surplus food towards the end of the day.
            </p>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const storeId = (item.storeId as any)?._id?.toString();
            const ratingData = storeId ? storeRatings[storeId] : null;
            const avgRating = ratingData ? ratingData.total / ratingData.count : undefined;

            return (
              <FoodCard
                key={item._id.toString()}
                id={item._id.toString()}
                name={item.name}
                // @ts-ignore - populated field
                storeName={item.storeId?.name || "Unknown Store"}
                originalPrice={item.originalPrice}
                discountedPrice={item.discountedPrice}
                expiresAt={item.expiresAt.toISOString()}
                imageUrl={item.imageUrl}
                quantityRemaining={item.quantityRemaining}
                category={item.category}
                averageRating={avgRating}
                ratingCount={ratingData?.count}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

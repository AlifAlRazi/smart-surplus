'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Star } from 'lucide-react';

interface FoodCardProps {
  id: string;
  name: string;
  storeName: string;
  originalPrice: number;
  discountedPrice: number;
  expiresAt: string;
  imageUrl?: string;
  quantityRemaining: number;
  category: string;
  averageRating?: number;
  ratingCount?: number;
}

export function FoodCard({
  id,
  name,
  storeName,
  originalPrice,
  discountedPrice,
  expiresAt,
  imageUrl,
  quantityRemaining,
  category,
  averageRating,
  ratingCount,
}: FoodCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return 'Expired';
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h remaining`;
      }
      return `${hours}h ${minutes}m remaining`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, [expiresAt]);

  const discountPercent = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  const isExpired = timeLeft === 'Expired';

  return (
    <Link href={`/dashboard/customer/listings/${id}`} className={`block group ${isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-emerald-200 group-hover:-translate-y-1">
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-400 capitalize bg-slate-100">
               {category} Image
            </div>
          )}
          
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {discountPercent}% OFF
          </div>
          
          {quantityRemaining <= 3 && quantityRemaining > 0 && (
             <div className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
               Only {quantityRemaining} left!
             </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-slate-900 truncate pr-4">{name}</h3>
              <div className="flex flex-col items-end">
                <span className="font-bold text-emerald-600">£{discountedPrice.toFixed(2)}</span>
                <span className="text-xs text-slate-400 line-through">£{originalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center text-sm text-slate-500 min-w-0">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
                <span className="truncate">{storeName}</span>
              </div>
              {averageRating && averageRating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ml-2">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>{averageRating.toFixed(1)}</span>
                  {ratingCount && <span className="text-slate-400 font-normal">({ratingCount})</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className={`flex items-center text-xs font-medium ${isExpired ? 'text-rose-500' : 'text-amber-600'}`}>
               <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
               {timeLeft}
            </div>
            <div className="text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Reserve →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

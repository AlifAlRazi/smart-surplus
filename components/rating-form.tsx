'use client';

import { useState, useTransition } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { submitRatingAction } from '@/app/dashboard/customer/orders/[id]/actions';
import { toast } from '@/hooks/use-toast';

interface RatingFormProps {
  orderId: string;
}

export function RatingForm({ orderId }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        await submitRatingAction(orderId, rating, comment);
        toast({
          title: "Thank you for your feedback!",
          description: "Your rating has been submitted.",
        });
      } catch (error: any) {
        toast({
          title: "Error submitting rating",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <Star className="w-5 h-5 text-emerald-600 fill-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 leading-tight">Rate your experience</h3>
          <p className="text-xs text-slate-500">Help others rescue food with confidence.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform active:scale-90"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hover || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Textarea
            placeholder="Tell us about the pickup or any feedback (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="pl-9 min-h-[100px] bg-white border-slate-200 rounded-xl"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isPending || rating === 0} 
          className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 rounded-xl py-6"
        >
          {isPending ? 'Submitting...' : (
            <span className="flex items-center gap-2">
              Submit Rating <Send className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

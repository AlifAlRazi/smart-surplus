'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl shadow-red-500/10 text-center">
         <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
         </div>
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
         <p className="text-slate-500 mb-8">
           We're having trouble loading this page. Our team has been notified.
         </p>
         <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.href = '/' } variant="outline">
              Go Home
            </Button>
            <Button onClick={() => reset()} className="bg-red-600 hover:bg-red-700">
              Try again
            </Button>
         </div>
      </div>
    </div>
  );
}

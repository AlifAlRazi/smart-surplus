'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignOutButtonProps {
  className?: string;
  variant?: 'ghost' | 'sidebar';
}

export function SignOutButton({ className, variant = 'ghost' }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleSignOut}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors",
          className
        )}
      >
        <LogOut className="w-5 h-5 text-red-500" />
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors",
        className
      )}
    >
      <span className="hidden sm:inline">Sign Out</span>
      <LogOut className="w-4 h-4 sm:hidden" />
    </button>
  );
}

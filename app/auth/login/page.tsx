'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const callbackUrl = searchParams.get('callbackUrl');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid email or password.');
      } else {
        router.push(callbackUrl || '/');
        router.refresh(); // Ensure layout header updates session state
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
        </div>

        {registered && (
          <div className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
            Account created successfully! Please sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required className="mt-1" />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required className="mt-1" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full bg-white text-slate-800 hover:bg-slate-50 border-slate-200" 
            onClick={() => signIn('google', { callbackUrl: '/dashboard/customer' })}
          >
             <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
             </svg>
             Google
          </Button>

          <p className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="/auth/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

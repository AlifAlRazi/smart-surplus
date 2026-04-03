'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { signupAction } from './actions';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<string>('customer');

  // Set initial role from URL if present
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['customer', 'business', 'reprocessor'].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    // Set a cookie so the server knows which role to assign after Google signup
    document.cookie = `pending_role=${role}; path=/; max-age=3600; SameSite=Lax`;
    
    // Redirect to the appropriate dashboard
    const callbackUrl = role === 'admin' ? '/admin' : `/dashboard/${role}`;
    signIn('google', { callbackUrl });
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');
    
    // Ensure the state role is injected into the formData if not already present
    // because shadcn Select might not natively bind to FormData sometimes.
    if (!formData.get('role')) {
      formData.set('role', role);
    }

    try {
      const res = await signupAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        router.push('/auth/login?registered=true');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Create an account</h2>
          <p className="mt-2 text-sm text-slate-600">Join Smart Surplus to reduce food waste.</p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required className="mt-1" />
            </div>

            <div>
              <Label htmlFor="phone">Phone number (optional)</Label>
              <Input id="phone" name="phone" type="tel" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required className="mt-1" />
            </div>

            <div>
              <Label htmlFor="role">I want to join as a:</Label>
              <Select name="role" required value={role} onValueChange={(v) => v && setRole(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer (Buy surplus food)</SelectItem>
                  <SelectItem value="business">Business Partner (List food)</SelectItem>
                  <SelectItem value="reprocessor">Food Reprocessor (Collect expired food)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign up'}
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
            onClick={handleGoogleSignIn}
          >
             <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
             </svg>
             Google
          </Button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <a href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

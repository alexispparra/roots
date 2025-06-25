"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth state is confirmed and we have a user,
    // they shouldn't be on the login/register pages. Redirect them.
    if (!loading && user) {
      router.replace('/projects');
    }
  }, [user, loading, router]);

  // While checking auth or if a user exists (and is about to be redirected), 
  // show a loader to prevent flashing the login page.
  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not loading and no user, show the login/register page content.
  return <>{children}</>;
}

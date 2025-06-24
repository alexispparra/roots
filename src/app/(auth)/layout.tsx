
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and a user exists, redirect to the main app.
    if (!loading && user) {
      router.replace('/projects');
    }
  }, [user, loading, router]);

  // While loading or if user exists (and redirect is imminent), show a loader.
  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not loading and no user, render the auth pages (login/register).
  return <>{children}</>;
}

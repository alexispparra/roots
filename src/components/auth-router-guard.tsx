'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Define which routes are for authentication or are public.
// Logged-in users should be redirected AWAY from these.
const PUBLIC_AUTH_PAGES = ['/', '/login', '/register']; 
const PROTECTED_APP_ROOT = '/projects';

/**
 * This component is the single source of truth for auth-based routing.
 * It ensures that users are in the correct part of the app based on their auth state.
 * 1. Unauthenticated users trying to access protected pages are sent to /login.
 * 2. Authenticated users trying to access public/auth pages are sent to the app.
 * It also handles showing a loading state to prevent content flashing.
 */
export function AuthRouterGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // This effect handles the actual redirection logic.
  // It runs only on the client, after the initial render and when dependencies change.
  useEffect(() => {
    // Don't do anything until Firebase has confirmed the auth state.
    if (loading) {
      return;
    }

    const isPublicAuthPage = PUBLIC_AUTH_PAGES.includes(pathname);

    // SCENARIO 1: User is logged in.
    if (user) {
      // If they are on a public/auth page, they should be redirected to the app.
      if (isPublicAuthPage) {
        router.replace(PROTECTED_APP_ROOT);
      }
      // If they are on a protected page, they are in the right place. Do nothing.
    } 
    // SCENARIO 2: User is NOT logged in.
    else {
      // If they are on a protected page, they must be sent to the login page.
      if (!isPublicAuthPage) {
        router.replace('/login');
      }
      // If they are on a public/auth page, they are in the right place. Do nothing.
    }
  }, [user, loading, pathname, router]);


  // This render logic prevents content flashing during auth checks and redirects.
  
  // While Firebase is checking the auth state, show a full-screen loader.
  // This is the most important check to prevent race conditions.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isPublicAuthPage = PUBLIC_AUTH_PAGES.includes(pathname);

  // After loading, if a redirect is going to happen, we also show a loader.
  // This prevents the user from seeing a "flash" of the wrong page.

  // Case A: Logged-in user on a public page (will be redirected to the app)
  if (user && isPublicAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Case B: Logged-out user on a protected page (will be redirected to login)
  if (!user && !isPublicAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If none of the above conditions are met, the user is clear to see the page.
  return <>{children}</>;
}

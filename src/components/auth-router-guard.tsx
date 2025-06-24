'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Define which routes are for authentication and which are public
const AUTH_ROUTES = ['/login', '/register'];
// The root landing page is public
const PUBLIC_ROUTES = ['/']; 

/**
 * This component acts as a central guard for routing.
 * It checks the user's authentication state against the current route
 * and performs redirects as needed, ensuring a single source of truth for auth-based routing.
 */
export function AuthRouterGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial authentication check is complete.
    if (loading) {
      return; 
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // Case 1: User is logged in, but is on a page meant for logged-out users
    // (e.g., login, register, or the public landing page). Redirect to the main app.
    if (user && (isAuthRoute || isPublicRoute)) {
      router.replace('/projects');
    } 
    // Case 2: User is not logged in and tries to access a protected page.
    else if (!user && !isAuthRoute && !isPublicRoute) {
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  // While the initial auth state is being determined, show a full-screen loader.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // --- Render logic to prevent content flashing during redirects ---

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If we are about to redirect a logged-in user away from an auth or public page,
  // show a loader instead of the page content for a moment.
  if (user && (isAuthRoute || isPublicRoute)) {
     return (
        <div className="flex items-center justify-center min-h-svh bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }

  // If we are about to redirect a logged-out user away from a protected page,
  // show a loader instead of the page content.
   if (!user && !isAuthRoute && !isPublicRoute) {
      return (
        <div className="flex items-center justify-center min-h-svh bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }
  
  // If no redirection is needed, render the actual page content.
  return <>{children}</>;
}

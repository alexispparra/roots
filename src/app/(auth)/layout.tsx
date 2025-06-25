
"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect handles redirection based on the user's authentication state.
    // If the authentication check is complete and a user is logged in,
    // they should be redirected to the main application.
    if (!authLoading && user) {
      router.replace('/projects');
    }
  }, [user, authLoading, router]);

  // Show a loader while the authentication state is being checked.
  // Also show a loader if a user is found, as we will be redirecting them shortly.
  // This prevents the login/register page from flashing briefly before the redirect.
  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the authentication check is complete and there is no user,
  // render the children (the login or register page).
  return <>{children}</>;
}

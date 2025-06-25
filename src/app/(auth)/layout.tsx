
"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the auth check is done and we have a user,
    // they shouldn't be on the login/register pages.
    // Redirect them to the app's main page.
    if (!authLoading && user) {
      router.replace('/projects');
    }
  }, [user, authLoading, router]);

  // While checking auth state, or if there's a user and we're about to redirect,
  // show a loader.
  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the check is done and there's no user, show the content (login/register page).
  return <>{children}</>;
}

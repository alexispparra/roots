
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in, redirect them to the projects page.
    // This prevents them from seeing the login/register page again.
    if (!loading && user) {
      router.replace('/projects');
    }
  }, [user, loading, router]);

  // While checking auth state, or if the user is logged in and we are about to redirect, show a loader.
  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not loading and no user, show the login/register page.
  return <div className="min-h-svh">{children}</div>;
}

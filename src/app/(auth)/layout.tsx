"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If Firebase is not configured, redirect to the main page since auth pages are not usable.
    if (!auth) {
      router.push('/');
      return;
    }
    // If Firebase is configured and user is logged in, redirect to main page.
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show a loader while checking auth status or if redirecting.
  if (!auth || loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render the auth page content (login/register)
  return <div className="min-h-screen">{children}</div>;
}

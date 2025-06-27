
"use client";

import React from "react";

export function AppContent({ children }: { children: React.ReactNode }) {
  // This component is now a simple pass-through. 
  // The complex error handling has been removed as it's no longer necessary.
  return <>{children}</>;
}

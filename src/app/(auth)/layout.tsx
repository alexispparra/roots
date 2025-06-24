// This layout is now just a pass-through. 
// All routing logic is handled by AuthRouterGuard in the root layout.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

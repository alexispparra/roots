
"use client";

// Este layout ya no se encarga de la lógica de redirección.
// Las páginas individuales (/login, /register) se encargarán de redirigir
// a los usuarios autenticados. Esto simplifica la lógica y previene
// las "carreras de condiciones" con el AuthGuard.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-svh">{children}</div>;
}

// Este layout ahora es un simple passthrough.
// La lógica de redirección se manejará directamente en las páginas de login/registro
// y en el layout principal de la aplicación para mayor robustez.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

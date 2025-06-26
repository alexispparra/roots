
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LandingLogo } from "@/components/landing-logo";
import { LandingIllustration } from "@/components/landing-illustration";
import Link from "next/link";
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario ya está logueado, redirigirlo a la página de proyectos.
    if (!loading && user) {
      router.replace('/projects');
    }
  }, [user, loading, router]);

  // Mientras se comprueba el estado de auth, o si ya hay un usuario y está a punto
  // de ser redirigido, mostrar un loader para evitar el parpadeo de la landing page.
  if (loading || user) {
     return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si no está cargando y no hay usuario, mostrar la landing page.
  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      <header className="container mx-auto flex h-24 items-center justify-between px-4">
        <LandingLogo className="h-20 w-auto" />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button asChild variant="ghost">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Crear Cuenta</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow container mx-auto flex flex-col items-center justify-center p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 w-full max-w-6xl">
            <section className="text-center lg:text-left flex-1">
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Gestiona tus Proyectos, <span className="text-primary">Simplificado</span>.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground mx-auto lg:mx-0">
                Desde el flujo de caja hasta la colaboración en equipo, Roots te da las herramientas para llevar tus emprendimientos al siguiente nivel.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start gap-4">
                <Button asChild size="lg">
                  <Link href="/register">Comienza Gratis</Link>
                </Button>
              </div>
            </section>
            <section className="hidden lg:flex flex-1 justify-center items-center">
              <LandingIllustration className="w-full max-w-lg" />
            </section>
        </div>
      </main>
      
      <footer className="container mx-auto border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Roots.oo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

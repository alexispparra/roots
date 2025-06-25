
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LandingLogo } from "@/components/landing-logo";
import Image from "next/image";
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

      <main className="flex-grow">
        <section className="container mx-auto flex flex-col items-center px-4 pt-16 pb-24 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Gestiona tus Proyectos, <span className="text-primary">Simplificado</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Desde el flujo de caja hasta la colaboración en equipo, Roots te da las herramientas para llevar tus emprendimientos al siguiente nivel.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild size="lg">
              <Link href="/register">Comienza Gratis</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="relative mx-auto w-full max-w-5xl">
            <div className="absolute -inset-2 rounded-xl bg-primary/10 blur-2xl" />
            <div
              className="relative aspect-[3/2] w-full rounded-xl bg-card shadow-2xl ring-1 ring-white/10"
              data-ai-hint="finance dashboard"
            >
            </div>
          </div>
        </section>
      </main>
      
      <footer className="container mx-auto border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Roots.oo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

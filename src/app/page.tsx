
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

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 container mx-auto items-center">
        <section className="flex flex-col items-center lg:items-start px-4 pt-16 pb-24 text-center lg:text-left">
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
        <div className="hidden lg:flex items-center justify-center p-8">
            <Image
                src="https://placehold.co/1200x800.png"
                alt="Dashboard de Roots"
                width={1200}
                height={800}
                className="rounded-xl shadow-2xl"
                data-ai-hint="dashboard analytics"
            />
        </div>
      </main>
      
      <footer className="container mx-auto border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Roots.oo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

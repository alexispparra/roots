
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

      <main className="flex-grow container mx-auto flex flex-col items-center justify-center py-16 text-center lg:flex-row lg:justify-between lg:text-left lg:gap-16">
        <section className="px-4">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Gestiona tus Proyectos, <span className="text-primary">Simplificado</span>.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground lg:mx-0">
            Desde el flujo de caja hasta la colaboración en equipo, Roots te da las herramientas para llevar tus emprendimientos al siguiente nivel.
          </p>
          <div className="mt-8 flex justify-center lg:justify-start gap-4">
            <Button asChild size="lg">
              <Link href="/register">Comienza Gratis</Link>
            </Button>
          </div>
        </section>
        <div className="mt-12 hidden lg:block lg:mt-0 lg:flex-shrink-0">
            <Image
                src="https://placehold.co/1200x800.png"
                alt="Dashboard de Roots"
                width={1200}
                height={800}
                className="rounded-xl shadow-2xl max-w-lg xl:max-w-2xl"
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

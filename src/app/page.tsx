
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/projects');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <Logo className="text-2xl"/>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Crear Cuenta</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto flex flex-col items-center px-4 pt-16 pb-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Gestiona tus Proyectos, <span className="text-primary">Simplificado</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Desde el flujo de caja hasta la colaboración en equipo, Roots te da las herramientas para llevar tus emprendimientos al siguiente nivel.
          </p>
          <div className="mt-8 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Comienza Gratis</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
            <div className="relative mx-auto w-full max-w-5xl">
                <div className="absolute -inset-2 rounded-xl bg-primary/10 blur-2xl"></div>
                <Image
                    src="https://placehold.co/1200x800.png"
                    alt="Captura de pantalla de la aplicación Roots"
                    width={1200}
                    height={800}
                    className="relative rounded-xl shadow-2xl ring-1 ring-white/10"
                    data-ai-hint="finance dashboard"
                />
            </div>
        </section>
      </main>

      <footer className="container mx-auto border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Roots. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

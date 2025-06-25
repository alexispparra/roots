
"use client"

import { useState } from "react"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { LandingLogo } from "@/components/landing-logo"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter();

  // Demo mode check
  if (!auth) {
    return (
       <div className="flex items-center justify-center min-h-svh bg-background">
          <Card className="mx-auto w-full max-w-md bg-card text-card-foreground border-border">
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center">Modo Demostración</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de Configuración</AlertTitle>
                    <AlertDescription>
                    La autenticación de Firebase no está configurada. Para habilitarla, crea un archivo `.env` en la raíz de tu proyecto y añade las variables de entorno de tu proyecto de Firebase (NEXT_PUBLIC_FIREBASE_...).
                    </AlertDescription>
                </Alert>
                 <Button asChild className="w-full mt-4">
                  <Link href="/">Volver al Inicio</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    )
  }


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      setError("Error de Configuración: La autenticación de Firebase no está disponible.");
      return;
    }

    setError(null)
    setIsFormLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // La redirección es manejada por AuthLayout
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError("Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.");
      } else {
        setError(`Error: ${err.message} (código: ${err.code})`);
      }
      console.error("Firebase Auth Error:", err);
    } finally {
        setIsFormLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError("Error de Configuración: La autenticación de Firebase no está disponible.");
      return;
    }
    setError(null)
    setIsGoogleLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider);
       // La redirección es manejada por AuthLayout
    } catch (err: any) {
      console.error("Firebase Google Auth Error:", err); // Log the full error for debugging

      // Handle specific, common errors with user-friendly messages
      if (err.code === 'auth/unauthorized-domain') {
          const hostname = window.location.hostname;
          setError(`Error de Dominio no Autorizado: El dominio '${hostname}' no está en la lista de dominios permitidos de Firebase. Ve a tu Consola de Firebase -> Authentication -> Settings -> Dominios autorizados y añádelo.`);
      } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
          setError("La ventana de inicio de sesión se cerró. Esto puede ocurrir si el dominio de la aplicación no está autorizado en Firebase. Asegúrate de que 'cloudworkstations.dev' está en la lista de dominios autorizados de tu proyecto.");
      } else if (err.code === 'auth/popup-blocked') {
          setError("El popup de inicio de sesión fue bloqueado por el navegador. Por favor, habilita los popups para este sitio e inténtalo de nuevo.");
      } else {
          // Generic fallback error
          setError(`Error inesperado: ${err.message} (Código: ${err.code})`);
      }
    } finally {
        setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-svh bg-background">
      <Card className="mx-auto w-full max-w-sm bg-card text-card-foreground border-border">
        <CardHeader className="space-y-4">
          <div className="flex justify-center p-6">
            <LandingLogo className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus datos para acceder a tus proyectos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de Inicio de Sesión</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormLoading || isGoogleLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormLoading || isGoogleLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isFormLoading || isGoogleLoading}>
              {isFormLoading ? <Loader2 className="animate-spin" /> : "Ingresar"}
            </Button>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={isFormLoading || isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="animate-spin mr-2" /> : 
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 56.6l-69.8 69.8C322.2 106.3 287.9 96 248 96c-88.8 0-160.1 71.1-160.1 160.1s71.3 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              }
              Ingresar con Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline hover:text-primary">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

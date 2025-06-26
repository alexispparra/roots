
"use client"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
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
import { USE_MOCK_DATA } from "@/lib/mock-data"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isFormLoading, setIsFormLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
     if (USE_MOCK_DATA) {
        // In mock mode, login is handled by the AuthContext and AuthLayout.
        // This form submission is effectively disabled.
        return;
    }

    if (!auth) {
      setError("La configuración de Firebase no está disponible. Por favor, contacta al soporte.");
      return;
    }

    setError(null)
    setIsFormLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The redirection is handled by AuthLayout
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
                disabled={isFormLoading}
              />
            </div>
            <div className="grid gap-2">
               <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                 <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline hover:text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isFormLoading}>
              {isFormLoading ? <Loader2 className="animate-spin" /> : "Ingresar"}
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

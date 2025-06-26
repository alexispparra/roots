
"use client"

import { useState } from "react"
import { getFirebaseInstances } from "@/lib/firebase"
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
import { Logo } from "@/components/logo"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isFormLoading, setIsFormLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsFormLoading(true)

    const firebase = getFirebaseInstances()
    if (!firebase) {
      // This message is a fallback. The main, more detailed error is now handled globally.
      setError("El servicio de autenticación no está disponible. Revisa la configuración.")
      setIsFormLoading(false)
      return
    }

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      await signInWithEmailAndPassword(firebase.auth, email, password)
      // La redirección es manejada por el AuthLayout al detectar el nuevo estado de autenticación
    } catch (error: any) {
      console.error("Firebase Login Error:", error.code, error.message)
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError("El correo electrónico o la contraseña son incorrectos.")
      } else {
        setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.")
      }
    } finally {
      setIsFormLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-svh bg-background">
      <Card className="mx-auto w-full max-w-sm bg-card text-card-foreground border-border">
        <CardHeader className="space-y-4">
          <div className="flex justify-center p-6">
            <Logo className="h-10 w-auto" />
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

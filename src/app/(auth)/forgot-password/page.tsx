
"use client"

import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase"
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
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { USE_MOCK_DATA } from "@/lib/mock-data"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // This check is now primarily for local development.
  // In production, USE_MOCK_DATA will be true, bypassing this.
  if (!isFirebaseConfigured && !USE_MOCK_DATA) {
    return (
       <div className="flex items-center justify-center min-h-svh bg-background">
          <Card className="mx-auto w-full max-w-md bg-card text-card-foreground border-border">
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center">Error de Configuración</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Firebase no configurado</AlertTitle>
                    <AlertDescription>
                    La autenticación de Firebase no está configurada. Para habilitarla, crea un archivo `.env` en la raíz de tu proyecto y añade las variables de entorno de tu proyecto de Firebase. Después, reinicia el servidor de desarrollo.
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      setError("Error de Configuración: La autenticación de Firebase no está disponible.");
      return;
    }

    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).");
    } catch (err: any) {
      // Don't reveal if the user exists or not, but log the error for debugging
      console.error("Password Reset Error:", err);
      // Still show a success message to prevent user enumeration
      setSuccess("Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).");
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-svh bg-background">
      <Card className="mx-auto w-full max-w-sm bg-card text-card-foreground border-border">
        <CardHeader className="space-y-4">
          <div className="flex justify-center p-6">
            <LandingLogo className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Restablecer Contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo para recibir un enlace de recuperación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Petición Enviada</AlertTitle>
                <AlertDescription>
                  {success}
                </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handlePasswordReset} className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
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
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Enviar Enlace"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" className="underline hover:text-primary">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

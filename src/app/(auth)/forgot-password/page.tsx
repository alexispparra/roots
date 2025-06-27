"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
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
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)


  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
        await sendPasswordReset(email)
        setSuccess("Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.")
    } catch (error: any) {
        console.error("Firebase Password Reset Error:", error.code, error.message)
        // For security, we don't reveal if a user doesn't exist.
        // We always show the success message.
        setSuccess("Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-svh bg-background">
      <Card className="mx-auto w-full max-w-sm bg-card text-card-foreground border-border">
        <CardHeader className="space-y-4">
          <div className="flex justify-center p-6">
            <Logo className="h-10 w-auto" />
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

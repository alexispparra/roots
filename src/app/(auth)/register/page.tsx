
"use client"

import { useState } from "react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
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

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
     if (USE_MOCK_DATA) {
        // In mock mode, this function does nothing as auth is handled by AuthContext
        return;
    }
    if (!auth) {
      setError("La configuración de Firebase no está disponible. Por favor, contacta al soporte.");
      return;
    }
    if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    setError(null)
    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      if (userCredential.user) {
          await updateProfile(userCredential.user, {
              displayName: `${firstName} ${lastName}`.trim()
          });
      }
      // La redirección es manejada por AuthLayout
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError("Este correo electrónico ya está en uso. Por favor, inicia sesión o usa otro correo.");
        } else {
            setError(`Error: ${err.message} (código: ${err.code})`);
        }
        console.error(err);
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-svh bg-background p-4">
      <Card className="mx-auto w-full max-w-sm bg-card text-card-foreground border-border">
        <CardHeader className="space-y-4">
           <div className="flex justify-center p-6">
            <LandingLogo className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Crear una Cuenta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus datos para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
             {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de Registro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="first-name">Nombre</Label>
                  <Input 
                      id="first-name" 
                      placeholder="Juan" 
                      required 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                  />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="last-name">Apellido</Label>
                  <Input 
                      id="last-name" 
                      placeholder="Pérez" 
                      required 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                  />
              </div>
            </div>
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
            <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Crear Cuenta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline hover:text-primary">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

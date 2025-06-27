"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.66 1.98-3.56 0-6.47-2.92-6.47-6.5s2.91-6.5 6.47-6.5c1.96 0 3.37.79 4.31 1.74l2.52-2.52C17.44 3.12 15.21 2 12.48 2 7.23 2 3.23 6.01 3.23 11.25s4 9.25 9.25 9.25c5.33 0 9.09-3.75 9.09-9.16 0-.58-.06-1.15-.15-1.71h-9.09z" />
  </svg>
)

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signInWithEmail(email, password)
      // Redirection is handled by AuthLayout
    } catch (error: any) {
      console.error("Firebase Login Error:", error.code, error.message)
      if (['auth/wrong-password', 'auth/user-not-found', 'auth/invalid-credential'].includes(error.code)) {
        setError("El correo electrónico o la contraseña son incorrectos.")
      } else {
        setError("Ocurrió un error inesperado al intentar iniciar sesión.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle();
      // Redirection is handled by AuthLayout
    } catch (error: any) {
      console.error("Google Login Error:", error)
      if (error.code !== 'auth/popup-closed-by-user') {
        setError("Ocurrió un error al iniciar sesión con Google. Por favor, inténtalo de nuevo.")
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const isAnyLoading = isLoading || isGoogleLoading

  return (
    <div className="flex items-center justify-center min-h-svh bg-background p-4">
      <Card className="mx-auto w-full max-w-sm bg-card text-card-foreground border-border">
        <CardHeader className="space-y-4">
          <div className="flex justify-center p-6">
            <Logo className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Bienvenido de Vuelta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
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
                disabled={isAnyLoading}
              />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link
                        href="/forgot-password"
                        className="ml-auto inline-block text-sm underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isAnyLoading}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isAnyLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Iniciar Sesión"}
            </Button>
          </form>
          
          <Separator className="my-6">
             <span className="bg-card px-2 text-xs text-muted-foreground">
                O CONTINÚA CON
             </span>
          </Separator>

          <Button onClick={handleGoogleLogin} variant="outline" className="w-full" disabled={isAnyLoading}>
            {isGoogleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Iniciar Sesión con Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline hover:text-primary">
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
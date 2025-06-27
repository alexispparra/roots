
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
import { Logo } from "@/components/logo"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Inline SVG for Google Logo to avoid extra dependencies
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.66 1.98-3.56 0-6.47-2.92-6.47-6.5s2.91-6.5 6.47-6.5c1.96 0 3.37.79 4.31 1.74l2.52-2.52C17.44 3.12 15.21 2 12.48 2 7.23 2 3.23 6.01 3.23 11.25s4 9.25 9.25 9.25c5.33 0 9.09-3.75 9.09-9.16 0-.58-.06-1.15-.15-1.71h-9.09z" />
  </svg>
)

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setError(null)
    setIsLoading(true)

    const firebase = getFirebaseInstances()
    if (!firebase) {
      setError("El servicio de autenticación no está disponible en este momento. Revisa la configuración de Firebase.")
      setIsLoading(false)
      return
    }

    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth")
      const provider = new GoogleAuthProvider()
      await signInWithPopup(firebase.auth, provider)
      // Redirection is handled by AuthLayout upon detecting the new auth state.
    } catch (error: any) {
      console.error("Google Login Error:", error)
      if (error.code === 'auth/popup-closed-by-user') {
        // Don't show an error if the user intentionally closes the popup.
      } else {
        setError("Ocurrió un error al intentar iniciar sesión con Google. Por favor, inténtalo de nuevo.")
      }
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
          <CardTitle className="text-2xl font-headline text-center">Bienvenido</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para acceder a tus proyectos
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de Inicio de Sesión</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleGoogleLogin} variant="outline" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Iniciar Sesión con Google
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

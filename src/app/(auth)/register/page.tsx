"use client"

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

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-4">
           <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Crear una Cuenta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus datos para comenzar a gestionar tus proyectos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="first-name">Nombre</Label>
                <Input id="first-name" placeholder="Juan" required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input id="last-name" placeholder="Pérez" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full">
              Crear Cuenta
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

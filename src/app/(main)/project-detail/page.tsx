"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectDetailPage() {
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Página en Mantenimiento</CardTitle>
                <CardDescription>
                    Esta página está temporalmente desactivada para resolver un problema del servidor.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-64 gap-4">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <p className="text-muted-foreground">
                    Estamos trabajando para restaurar la funcionalidad completa.
                </p>
                <Button asChild>
                    <Link href="/">Volver al Panel</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

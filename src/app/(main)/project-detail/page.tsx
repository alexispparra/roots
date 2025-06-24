"use client"

import { useSearchParams } from 'next/navigation'
import { useProjects } from '@/contexts/ProjectsContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertTriangle, Briefcase, BarChart2, List, Users, Settings } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectSettingsForm } from '@/components/project-settings-form'

export default function ProjectDetailPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')
  const { getProjectById, loading } = useProjects()

  const project = getProjectById(projectId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Proyecto no Encontrado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-64 gap-4">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <p className="text-muted-foreground">
            El proyecto que buscas no existe o no tienes permiso para verlo.
          </p>
          <Button asChild>
            <Link href="/projects">Volver a Proyectos</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{project.name}</CardTitle>
          <CardDescription>{project.description || "Este proyecto no tiene una descripción."}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" className="grid gap-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="dashboard"><BarChart2 className="mr-2 h-4 w-4" />Resumen</TabsTrigger>
          <TabsTrigger value="transactions"><List className="mr-2 h-4 w-4" />Transacciones</TabsTrigger>
          <TabsTrigger value="categories"><Briefcase className="mr-2 h-4 w-4" />Categorías</TabsTrigger>
          <TabsTrigger value="team"><Users className="mr-2 h-4 w-4" />Equipo</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Resumen del Proyecto</CardTitle>
                <CardDescription>Métricas clave y estado general de tu proyecto.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                <BarChart2 className="h-16 w-16 mb-4" />
                <p>El resumen financiero estará disponible aquí pronto.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Transacciones</CardTitle>
                <CardDescription>Todos los ingresos y gastos registrados en el proyecto.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                <List className="h-16 w-16 mb-4" />
                <p>El registro de transacciones estará disponible aquí pronto.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Categorías de Gastos</CardTitle>
                <CardDescription>Gestiona las categorías y presupuestos para los gastos de tu proyecto.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                <Briefcase className="h-16 w-16 mb-4" />
                <p>La gestión de categorías estará disponible aquí pronto.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Equipo del Proyecto</CardTitle>
                <CardDescription>Gestiona los participantes y sus permisos en este proyecto.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                <Users className="h-16 w-16 mb-4" />
                <p>La gestión de equipo estará disponible aquí pronto.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <ProjectSettingsForm project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

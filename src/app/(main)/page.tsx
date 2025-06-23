
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Briefcase, Users, Target } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjects } from "@/contexts/ProjectsContext";
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
  const { projects, loading } = useProjects();
  const activeProjects = projects.filter(p => p.status === 'En Curso');
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Panel Global</CardTitle>
          <CardDescription>Un resumen de todos tus emprendimientos.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold font-headline">{activeProjects.length}</div>}
            <p className="text-xs text-muted-foreground">
              {loading ? <Skeleton className="h-4 w-24 mt-1" /> : `de ${projects.length} proyectos totales`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inversión Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-emerald-600">$45,500.00</div>
            <p className="text-xs text-muted-foreground">
              en todos los proyectos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Meta</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">Campaña Q3</div>
            <p className="text-xs text-muted-foreground">
              Finaliza en 2 semanas
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle className="font-headline">Resumen de Proyectos</CardTitle>
            <CardDescription>
              El estado actual de tus emprendimientos.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/projects">
              Ver Todos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Proyecto</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-2 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : projects.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aún no participas en ningún proyecto. ¡Crea uno para empezar!
                  </TableCell>
                </TableRow>
              ) : (
                projects.map(proj => (
                <TableRow key={proj.id}>
                  <TableCell className="font-medium">
                    <Link href={`/project-detail?id=${proj.id}`} className="hover:underline">
                      {proj.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {proj.participants.map((p, i) => (
                        <Avatar key={i} className="border-2 border-card">
                          <AvatarImage src={p.src} />
                          <AvatarFallback>{p.fallback || p.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={proj.status === 'Completado' ? 'secondary' : 'default'} className={proj.status === 'En Curso' ? 'bg-blue-500/20 text-blue-700' : proj.status === 'Próximo' ? 'bg-amber-500/20 text-amber-700' : ''}>
                      {proj.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Progress value={proj.progress} className="h-2" />
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

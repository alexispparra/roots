import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const projects = [
    { 
        id: 'PROJ-001', 
        name: 'Lanzamiento App Móvil', 
        description: 'Desarrollo y lanzamiento de una nueva aplicación móvil para iOS y Android.',
        status: 'En Curso',
        investment: '10,000',
        participants: [
            { name: 'AL', src: 'https://placehold.co/40x40.png' },
            { name: 'BC', src: 'https://placehold.co/40x40.png' },
        ]
    },
    { 
        id: 'PROJ-002', 
        name: 'Rediseño Web Corporativa', 
        description: 'Actualización completa del sitio web de la empresa con un nuevo diseño y CMS.',
        status: 'Completado',
        investment: '25,000', 
        participants: [
            { name: 'DE', src: 'https://placehold.co/40x40.png' },
        ]
    },
    { 
        id: 'PROJ-003', 
        name: 'Campaña Marketing Q3', 
        description: 'Campaña publicitaria digital para el tercer trimestre del año.',
        status: 'En Curso',
        investment: '7,500', 
        participants: [
            { name: 'FG', src: 'https://placehold.co/40x40.png' },
            { name: 'HI', src: 'https://placehold.co/40x40.png' },
            { name: 'JK', src: 'https://placehold.co/40x40.png' },
        ]
    },
    { 
        id: 'PROJ-004', 
        name: 'Investigación de Mercado', 
        description: 'Estudio de mercado para identificar nuevas oportunidades de negocio.',
        status: 'Próximo',
        investment: '3,000', 
        participants: [
            { name: 'LM', src: 'https://placehold.co/40x40.png' },
        ]
    },
];

export default function ProjectsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Mis Proyectos</CardTitle>
            <CardDescription>Gestiona todos tus emprendimientos desde un solo lugar.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2" />
            Crear Proyecto
          </Button>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-xl">{project.name}</CardTitle>
                <Badge variant={project.status === 'Completado' ? 'secondary' : 'default'} className={project.status === 'En Curso' ? 'bg-blue-500/20 text-blue-700' : project.status === 'Próximo' ? 'bg-amber-500/20 text-amber-700' : ''}>{project.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground pt-2">{project.description}</p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inversión</span>
                <span className="font-semibold">${project.investment}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Participantes</span>
                <div className="flex -space-x-2">
                  {project.participants.map((p, i) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-card">
                      <AvatarImage src={p.src} />
                      <AvatarFallback>{p.name}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/project-detail?id=${project.id}`}>Ver Detalles</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

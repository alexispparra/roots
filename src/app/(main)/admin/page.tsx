
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/contexts/ProjectsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { projects, updateParticipantRole } = useProjects();
  const { isAppAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAppAdmin) {
      router.push('/'); // Redirect non-admins to the dashboard
    }
  }, [isAppAdmin, loading, router]);

  if (loading || !isAppAdmin) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p>Verificando permisos de administrador...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Panel de Administración Global</CardTitle>
          <CardDescription>
            Gestiona los roles de todos los participantes en todos los proyectos de la aplicación.
          </CardDescription>
        </CardHeader>
      </Card>

      {projects.length === 0 ? (
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground">No hay proyectos para administrar todavía.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
            {projects.map(project => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.participants.map(participant => (
                    <div key={participant.email} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={participant.src} />
                          <AvatarFallback>{participant.fallback || participant.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                        </div>
                      </div>
                      <div>
                        <Select
                          value={participant.role}
                          onValueChange={(newRole: 'admin' | 'editor' | 'viewer') => updateParticipantRole(project.id, participant.email, newRole)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Lector</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

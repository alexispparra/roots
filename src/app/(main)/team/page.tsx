
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/contexts/ProjectsContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Participant } from "@/contexts/ProjectsContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPage() {
  const { projects, updateParticipantRole, loading } = useProjects();
  const { user } = useAuth();

  const renderContent = () => {
    if (loading) {
       return (
         <div className="grid gap-8">
            {[1, 2].map(i => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {[1, 2, 3].map(j => (
                         <div key={j} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-[180px]" />
                        </div>
                       ))}
                    </CardContent>
                </Card>
            ))}
        </div>
       )
    }

    if (projects.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    Aún no participas en ningún proyecto.
                </CardContent>
            </Card>
        )
    }
    
    return (
       <div className="grid gap-8">
        {projects.map(project => {
          const currentUserParticipant = project.participants.find(p => p.email === user?.email);
          const isCurrentUserAdmin = currentUserParticipant?.role === 'admin';

          return (
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
                        {isCurrentUserAdmin ? (
                          <Select
                            value={participant.role}
                            onValueChange={(newRole: 'admin' | 'editor' | 'viewer') => updateParticipantRole(project.id, participant.email, newRole)}
                            // Disable selector for the admin editing their own role
                            disabled={participant.email === user?.email}
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
                        ) : (
                          <p className="text-sm font-medium capitalize bg-muted px-3 py-1.5 rounded-md">{participant.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gestión de Equipo y Permisos</CardTitle>
          <CardDescription>
            Asigna roles a los participantes en cada proyecto. Solo los administradores pueden cambiar los permisos.
          </CardDescription>
        </CardHeader>
      </Card>
      {renderContent()}
    </div>
  );
}

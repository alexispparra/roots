
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProjects } from "@/contexts/ProjectsContext";
import { type Project, type Participant, type UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

const addParticipantSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  role: z.enum(["editor", "viewer"], { required_error: "Debes seleccionar un rol." }),
});

type AddParticipantFormData = z.infer<typeof addParticipantSchema>;

export function ProjectTeamTab({ project }: { project: Project }) {
  const { user: currentUser } = useAuth();
  const { addParticipantToProject, updateParticipantRoleInProject, removeParticipantFromProject } = useProjects();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  
  const form = useForm<AddParticipantFormData>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });
  
  const onSubmit = (data: AddParticipantFormData) => {
    if (data.email === currentUser?.email) {
      form.setError("email", { message: "No puedes invitarte a ti mismo al proyecto." });
      return;
    }
    addParticipantToProject(project.id, data.email, data.role);
    form.reset();
  };
  
  const handleRoleChange = (email: string, newRole: UserRole) => {
    updateParticipantRoleInProject(project.id, email, newRole);
  };

  const handleDeleteClick = (participant: Participant) => {
    setParticipantToDelete(participant);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (participantToDelete) {
      removeParticipantFromProject(project.id, participantToDelete.email);
      setParticipantToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    admin: "Administrador",
    editor: "Editor",
    viewer: "Espectador",
  };

  return (
    <>
      <Card className="light-data-card">
        <CardHeader>
          <CardTitle className="font-headline">Equipo del Proyecto</CardTitle>
          <CardDescription>
            Gestiona quién tiene acceso a este proyecto y qué puede hacer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1 w-full">
                      <FormLabel>Correo del Nuevo Miembro</FormLabel>
                      <FormControl>
                        <Input placeholder="nombre@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="editor">{roleLabels.editor}</SelectItem>
                          <SelectItem value="viewer">{roleLabels.viewer}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-8">
                  <Button type="submit">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Invitar
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <Separator />
          
          <div className="mt-6">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {project.participants.map((participant) => (
                        <TableRow key={participant.email}>
                            <TableCell className="font-medium">{participant.name}</TableCell>
                            <TableCell>{participant.email}</TableCell>
                            <TableCell>
                                {participant.role === 'admin' || participant.email === currentUser?.email ? (
                                    <span>{roleLabels[participant.role]}</span>
                                ) : (
                                    <Select 
                                        defaultValue={participant.role}
                                        onValueChange={(newRole) => handleRoleChange(participant.email, newRole as UserRole)}
                                    >
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="editor">{roleLabels.editor}</SelectItem>
                                            <SelectItem value="viewer">{roleLabels.viewer}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </TableCell>
                            <TableCell>
                                {participant.role !== 'admin' && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteClick(participant)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar miembro del proyecto?"
        description={`¿Estás seguro de que quieres eliminar a ${participantToDelete?.email} del proyecto? Perderá todo el acceso. Esta acción no se puede deshacer.`}
      />
    </>
  );
}

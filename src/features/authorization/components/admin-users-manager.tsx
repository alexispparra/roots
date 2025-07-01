"use client";

import { useState, useEffect, useMemo, ReactNode } from 'react';
import { getFirebaseInstances } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import type { DbUser, UserStatus } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const statusMap: Record<UserStatus, string> = {
  approved: "Aprobado",
  pending: "Pendiente",
  rejected: "Rechazado",
};

// A sub-component to render the list of users, adapting between table and card view.
function UsersList({ users, onUpdateStatus }: { users: DbUser[], onUpdateStatus: (uid: string, status: UserStatus) => void }) {
  if (users.length === 0) {
    return <div className="text-center text-muted-foreground py-10 px-4">No hay usuarios en esta categoría.</div>;
  }
  
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Acciones para {user.displayName}</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status !== 'approved' && <DropdownMenuItem onClick={() => onUpdateStatus(user.uid, 'approved')}>Aprobar</DropdownMenuItem>}
                      {user.status !== 'pending' && <DropdownMenuItem onClick={() => onUpdateStatus(user.uid, 'pending')}>Marcar como Pendiente</DropdownMenuItem>}
                      {user.status !== 'rejected' && <DropdownMenuItem onClick={() => onUpdateStatus(user.uid, 'rejected')}>Rechazar</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Mobile Card View */}
      <div className="block md:hidden p-4 space-y-4">
        {users.map((user) => (
          <Card key={user.uid}>
            <CardHeader className="flex-row items-center justify-between pb-2">
               <div className="flex-1">
                 <CardTitle className="text-base">{user.displayName}</CardTitle>
                 <CardDescription>{user.email}</CardDescription>
               </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mr-2">
                        <span className="sr-only">Acciones para {user.displayName}</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status !== 'approved' && <DropdownMenuItem onClick={() => onUpdateStatus(user.uid, 'approved')}>Aprobar</DropdownMenuItem>}
                      {user.status !== 'pending' && <DropdownMenuItem onClick={() => onUpdateStatus(user.uid, 'pending')}>Marcar como Pendiente</DropdownMenuItem>}
                      {user.status !== 'rejected' && <DropdownMenuItem onClick={() => onUpdateStatus(user.uid, 'rejected')}>Rechazar</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}

export function AdminUsersManager() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: adminUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!adminUser) return;

    const { db } = getFirebaseInstances();
    const usersCol = collection(db, 'users');

    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const userList = snapshot.docs.map(doc => doc.data() as DbUser);
      setUsers(userList);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching users:", err);
      if (err.code === 'permission-denied') {
        setError("No tienes permiso para ver la lista de usuarios. Por favor, revisa las reglas de seguridad de Firestore.");
      } else {
        setError("Ocurrió un error inesperado al cargar los usuarios.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUser]);

  const handleUpdateStatus = async (uid: string, status: UserStatus) => {
    const { db } = getFirebaseInstances();
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, { status });
      toast({ title: 'Estado actualizado', description: `El usuario ahora está ${statusMap[status].toLowerCase()}.`});
    } catch (err: any) {
      console.error('Failed to update user status', err);
       const description = err.code === 'permission-denied'
        ? "No tienes permiso para modificar usuarios."
        : "No se pudo actualizar el estado del usuario."
      toast({ variant: 'destructive', title: 'Error', description });
    }
  };

  const categorizedUsers = useMemo(() => {
    const pending: DbUser[] = [];
    const approved: DbUser[] = [];
    const rejected: DbUser[] = [];

    users.forEach(user => {
      if(user.uid === adminUser?.uid) return; // Don't show admin in the lists
      
      switch(user.status) {
        case 'pending':
          pending.push(user);
          break;
        case 'approved':
          approved.push(user);
          break;
        case 'rejected':
          rejected.push(user);
          break;
        default:
          pending.push(user);
          break;
      }
    });
    return { pending, approved, rejected };
  }, [users, adminUser]);

  if (loading) {
    return (
        <Card className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
        </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de Acceso</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <Tabs defaultValue="pending">
          <TabsList className="m-4">
            <TabsTrigger value="pending">
              Pendientes <Badge variant="secondary" className="ml-2">{categorizedUsers.pending.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprobados <Badge className="ml-2">{categorizedUsers.approved.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rechazados <Badge variant="destructive" className="ml-2">{categorizedUsers.rejected.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="m-0 border-t">
            <UsersList users={categorizedUsers.pending} onUpdateStatus={handleUpdateStatus} />
          </TabsContent>
          <TabsContent value="approved" className="m-0 border-t">
             <UsersList users={categorizedUsers.approved} onUpdateStatus={handleUpdateStatus} />
          </TabsContent>
          <TabsContent value="rejected" className="m-0 border-t">
            <UsersList users={categorizedUsers.rejected} onUpdateStatus={handleUpdateStatus} />
          </TabsContent>
        </Tabs>
    </Card>
  );
}

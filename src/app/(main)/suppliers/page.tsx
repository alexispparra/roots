
"use client";

import { useState, useEffect } from 'react';
import { getFirebaseInstances } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { Supplier, SupplierFormData } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, MoreHorizontal, Pencil, Trash2, Truck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { addSupplier, updateSupplier, deleteSupplier } from '@/features/suppliers/actions';
import { AddSupplierDialog } from '@/components/add-supplier-dialog';
import { EditSupplierDialog } from '@/components/edit-supplier-dialog';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const { db } = getFirebaseInstances();
    const q = query(collection(db, 'suppliers'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const suppliersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as Supplier));
      setSuppliers(suppliersList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching suppliers:", err);
      setError("No se pudieron cargar los proveedores. Revisa las reglas de seguridad de Firestore.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAdd = async (data: SupplierFormData) => {
    try {
      await addSupplier(data);
      toast({ title: "Proveedor añadido", description: `El proveedor "${data.name}" ha sido creado.` });
      setIsAddDialogOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo añadir el proveedor." });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdate = async (data: SupplierFormData) => {
    if (!selectedSupplier) return;
    try {
      await updateSupplier(selectedSupplier.id, data);
      toast({ title: "Proveedor actualizado" });
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo actualizar el proveedor." });
    }
  };

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;
    try {
      await deleteSupplier(selectedSupplier.id);
      toast({ title: "Proveedor eliminado" });
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar el proveedor." });
    }
  };

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Proveedores</CardTitle>
              <CardDescription>Gestiona tu base de datos de proveedores para todos tus proyectos.</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Proveedor
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
              <div className="text-destructive text-center py-10">{error}</div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Rubro</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.length > 0 ? suppliers.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.rubro}</TableCell>
                          <TableCell>{s.phone || '-'}</TableCell>
                          <TableCell>{s.email || '-'}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(s)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(s)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center">No hay proveedores. Añade el primero.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile Card List */}
                <div className="block md:hidden space-y-4">
                  {suppliers.length > 0 ? suppliers.map(s => (
                    <Card key={s.id}>
                      <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-medium leading-snug truncate">{s.name}</CardTitle>
                          <CardDescription>{s.rubro}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 -mr-2 -mt-2 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(s)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(s)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-sm space-y-1 text-muted-foreground">
                        <p><strong>Teléfono:</strong> {s.phone || '-'}</p>
                        <p><strong>Email:</strong> {s.email || '-'}</p>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center">
                        <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay proveedores todavía.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddSupplierDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddSupplier={handleAdd}
      />
      <EditSupplierDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateSupplier={handleUpdate}
        supplier={selectedSupplier}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar este proveedor?"
        description="Esta acción no se puede deshacer. El proveedor se eliminará permanentemente."
      />
    </>
  );
}

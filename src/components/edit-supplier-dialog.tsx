
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupplierFormSchema, type SupplierFormData, type Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type EditSupplierDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSupplier: (data: SupplierFormData) => void;
  supplier: Supplier | null;
};

export function EditSupplierDialog({ isOpen, onOpenChange, onUpdateSupplier, supplier }: EditSupplierDialogProps) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierFormSchema),
  });

  useEffect(() => {
    if (supplier) {
      form.reset(supplier);
    }
  }, [supplier, form, isOpen]);

  const handleSubmit = (values: SupplierFormData) => {
    onUpdateSupplier(values);
  };
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Proveedor</DialogTitle>
          <DialogDescription>
            Actualiza los detalles del proveedor.
          </DialogDescription>
        </DialogHeader>
        {supplier && (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl><Input placeholder="Ej: Ferretería Industrial S.A." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rubro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rubro</FormLabel>
                      <FormControl><Input placeholder="Ej: Materiales de Construcción" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl><Textarea placeholder="Describe brevemente al proveedor..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (Opcional)</FormLabel>
                      <FormControl><Input placeholder="11-2233-4455" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Opcional)</FormLabel>
                      <FormControl><Input type="email" placeholder="contacto@ejemplo.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección (Opcional)</FormLabel>
                    <FormControl><Input placeholder="Av. Siempre Viva 742" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="cuit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CUIT (Opcional)</FormLabel>
                      <FormControl><Input placeholder="30-12345678-9" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                  <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

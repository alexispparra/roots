
"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Upload, Camera, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProjects, type Transaction, UpdateExpenseFormSchema, type UpdateExpenseInput } from "@/contexts/ProjectsContext"
import { CameraCaptureDialog } from "./camera-capture-dialog"
import Image from "next/image"
import { Separator } from "./ui/separator"

type EditExpenseDialogProps = {
  expense: Transaction | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: { name: string }[]
  participants: { name: string }[]
  onUpdateExpense: (data: UpdateExpenseInput) => void;
}

export function EditExpenseDialog({ expense, isOpen, onOpenChange, categories, participants, onUpdateExpense }: EditExpenseDialogProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateExpenseInput>({
    resolver: zodResolver(UpdateExpenseFormSchema),
  })

  const { watch, setValue } = form;
  const attachment = watch("attachmentDataUrl");
  const isUpdating = useRef(false);

  useEffect(() => {
    if (expense) {
      const exchangeRate = expense.exchangeRate || 1;
      const amountUSD = (expense.amountARS && exchangeRate) 
        ? expense.amountARS / exchangeRate 
        : 0;

      form.reset({
        ...expense,
        date: expense.date.toDate(),
        exchangeRate,
        amountUSD,
        attachmentDataUrl: expense.attachmentDataUrl || "",
      })
    }
  }, [expense, form, isOpen])

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (isUpdating.current) return;
      
      const { amountARS = 0, amountUSD = 0, exchangeRate = 1 } = value;

      isUpdating.current = true;
      
      if (name === 'amountARS') {
        if (exchangeRate > 0) {
          setValue('amountUSD', amountARS / exchangeRate, { shouldValidate: true });
        }
      } else if (name === 'amountUSD') {
        if (exchangeRate > 0) {
          setValue('amountARS', amountUSD * exchangeRate, { shouldValidate: true });
        }
      } else if (name === 'exchangeRate') {
        if (amountARS > 0 && exchangeRate > 0) {
          setValue('amountUSD', amountARS / exchangeRate, { shouldValidate: true });
        } else if (amountUSD > 0 && exchangeRate > 0) {
          setValue('amountARS', amountUSD * exchangeRate, { shouldValidate: true });
        }
      }
      
      requestAnimationFrame(() => {
        isUpdating.current = false;
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  function onSubmit(values: UpdateExpenseInput) {
    let { amountARS, amountUSD, exchangeRate } = values;
    if (amountUSD > 0 && amountARS === 0 && exchangeRate > 0) {
      values.amountARS = amountUSD * exchangeRate;
    } else if (amountARS > 0 && (exchangeRate === 0 || !exchangeRate)) {
      values.exchangeRate = 1;
    }
    onUpdateExpense(values);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("attachmentDataUrl", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Editar Gasto</DialogTitle>
              <DialogDescription>
                Actualiza los detalles de este movimiento.
              </DialogDescription>
            </DialogHeader>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Publicidad en Instagram" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Gasto</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {participants.map(p => (
                          <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {categories.map(c => (
                          <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amountARS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto (AR$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cambio (a U$S)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountUSD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto (U$S)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medio de Pago</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un medio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Banco">Banco</SelectItem>
                        <SelectItem value="Factura">Factura</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

             <Separator className="my-4" />

              <div className="grid gap-4">
                <h3 className="text-sm font-medium text-muted-foreground">Adjuntar Comprobante (Opcional)</h3>
                {attachment ? (
                  <div className="relative w-48 h-48 border rounded-md">
                    <Image src={attachment} alt="Vista previa del comprobante" layout="fill" objectFit="contain" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => setValue("attachmentDataUrl", "", { shouldValidate: true })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCameraOpen(true)}>
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>
                )}
              </div>

            <DialogFooter className="pt-8">
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <CameraCaptureDialog
        isOpen={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onCapture={(dataUrl) => setValue("attachmentDataUrl", dataUrl, { shouldValidate: true })}
      />
    </Dialog>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

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
import type { Transaction } from "@/contexts/ProjectsContext"

const formSchema = z.object({
  id: z.string(),
  date: z.date({
    required_error: "La fecha es requerida.",
  }),
  description: z.string().min(1, "La descripción es requerida."),
  category: z.string().min(1, "La categoría es requerida."),
  user: z.string().min(1, "El usuario es requerido."),
  paymentMethod: z.string().min(1, "El medio de pago es requerido."),
  amountARS: z.coerce.number().min(0, "El monto no puede ser negativo."),
  exchangeRate: z.coerce.number().min(0, "El cambio no puede ser negativo."),
  amountUSD: z.coerce.number().min(0, "El monto no puede ser negativo."),
}).refine(data => data.amountARS > 0 || data.amountUSD > 0, {
  message: "Debes ingresar un monto en AR$ o U$S.",
  path: ["amountARS"],
});

type EditExpenseDialogProps = {
  expense: Transaction | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: { name: string }[]
  participants: { name: string }[]
  onUpdateExpense: (data: Omit<z.infer<typeof formSchema>, 'amountUSD'>) => void;
}

export function EditExpenseDialog({ expense, isOpen, onOpenChange, categories, participants, onUpdateExpense }: EditExpenseDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { watch, setValue } = form;
  const isUpdating = useRef(false);

  useEffect(() => {
    if (expense) {
      const amountUSD = (expense.amountARS && expense.exchangeRate) 
        ? expense.amountARS / expense.exchangeRate 
        : 0;

      form.reset({
        ...expense,
        date: expense.date.toDate(),
        amountUSD,
      })
    }
  }, [expense, form, isOpen])

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (isUpdating.current) return;
      
      const { amountARS = 0, amountUSD = 0, exchangeRate = 0 } = value;

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { amountARS, amountUSD, exchangeRate, ...rest } = values;
    let finalExchangeRate = exchangeRate;

    if ((!finalExchangeRate || finalExchangeRate <= 0) && amountARS > 0 && amountUSD > 0) {
        finalExchangeRate = amountARS / amountUSD;
    }
    
    onUpdateExpense({ ...rest, amountARS, exchangeRate: finalExchangeRate });
  }

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
                      <Input type="number" placeholder="1050" {...field} />
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
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

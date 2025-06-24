
"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, PlusCircle } from "lucide-react"

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
  DialogTrigger,
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

const formSchema = z.object({
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

type CreateExpenseDialogProps = {
  categories: { name: string }[]
  participants: { name: string }[]
  onAddExpense: (data: Omit<z.infer<typeof formSchema>, 'amountUSD'>) => void;
}

export function CreateExpenseDialog({ categories, participants, onAddExpense }: CreateExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      user: "",
      category: categories.length === 1 ? categories[0].name : "",
      paymentMethod: "",
      amountARS: 0,
      exchangeRate: 1,
      amountUSD: 0,
    },
  })

  const { watch, setValue } = form;
  const isUpdating = useRef(false);

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
        // Prioritize calculating USD from ARS if ARS has a value
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

    // If exchange rate is not set, calculate it from ARS and USD
    if ((!finalExchangeRate || finalExchangeRate <= 0) && amountARS > 0 && amountUSD > 0) {
        finalExchangeRate = amountARS / amountUSD;
    }

    onAddExpense({ ...rest, amountARS, exchangeRate: finalExchangeRate });
    setOpen(false)
    form.reset({
      date: new Date(),
      description: "",
      user: "",
      category: categories.length === 1 ? categories[0].name : "",
      paymentMethod: "",
      amountARS: 0,
      exchangeRate: 1,
      amountUSD: 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="ml-auto gap-1">
          <PlusCircle className="h-4 w-4" />
          Registrar Gasto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
              <DialogDescription>
                Añade un nuevo movimiento a las finanzas del proyecto.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={categories.length === 1}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="submit">Registrar Gasto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

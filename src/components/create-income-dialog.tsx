
"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, PlusCircle, Upload, Camera, X } from "lucide-react"
import Image from "next/image"

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
import { Separator } from "@/components/ui/separator"
import { AddIncomeFormSchema, type AddIncomeInput } from "@/lib/types"
import { CameraCaptureDialog } from "./camera-capture-dialog"

type CreateIncomeDialogProps = {
  onAddIncome: (data: AddIncomeInput) => void;
}

export function CreateIncomeDialog({ onAddIncome }: CreateIncomeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AddIncomeInput>({
    resolver: zodResolver(AddIncomeFormSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      amountARS: 0,
      exchangeRate: undefined,
      amountUSD: 0,
      attachmentDataUrl: "",
    },
  })

  const { watch, setValue } = form;
  const attachment = watch("attachmentDataUrl");

  function onSubmit(values: AddIncomeInput) {
    onAddIncome(values);
    setOpen(false)
    form.reset({
      date: new Date(),
      description: "",
      amountARS: 0,
      exchangeRate: undefined,
      amountUSD: 0,
      attachmentDataUrl: "",
    })
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
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-9 px-3 w-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-500 font-semibold">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ingreso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
          <DialogDescription>
            Añade un nuevo ingreso a las finanzas del proyecto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Aporte de socio" {...field} />
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
                    <FormLabel>Fecha del Ingreso</FormLabel>
                    <Popover modal={true}>
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
               <div />
              <FormField
                control={form.control}
                name="amountARS"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto (AR$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 100000" {...field} />
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
                      <Input type="number" placeholder="Ej: 1050" {...field} />
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
            </div>

            <Separator />

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

            <DialogFooter>
              <Button type="submit">Registrar Ingreso</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
     <CameraCaptureDialog
        isOpen={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onCapture={(dataUrl) => setValue("attachmentDataUrl", dataUrl, { shouldValidate: true })}
      />
    </>
  )
}

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

// Schemas
const profileFormSchema = z.object({
  displayName: z.string().min(1, "El nombre es requerido."),
});

const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida."),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName || "",
      });
    }
  }, [user, profileForm]);


  // Update profile handler
  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) return;
    setIsProfileLoading(true);
    try {
      await updateProfile(user, { displayName: values.displayName });
      toast({
        title: "Perfil Actualizado",
        description: "Tu nombre ha sido actualizado.",
      });
      // Force a re-render of layout to reflect name change in sidebar
      router.refresh(); 
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil.",
      });
    } finally {
      setIsProfileLoading(false);
    }
  }

  // Update password handler
  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    if (!user || !user.email) return;

    setIsPasswordLoading(true);
    setPasswordError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      // Re-authenticate user before changing password
      await reauthenticateWithCredential(user, credential);
      
      // Now change the password
      await updatePassword(user, values.newPassword);
      
      toast({
        title: "Contraseña Actualizada",
        description: "Tu contraseña ha sido cambiada. Se cerrará tu sesión por seguridad.",
      });

      // Sign out user and redirect to login after password change
      if(auth) {
        await auth.signOut();
      }
      router.push("/login");

    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setPasswordError("La contraseña actual es incorrecta.");
        passwordForm.setError("currentPassword", { message: " " });
      } else {
        console.error("Error updating password:", error);
        setPasswordError("Ocurrió un error inesperado al cambiar la contraseña.");
      }
    } finally {
      setIsPasswordLoading(false);
    }
  }

  if (!user) {
    // This should ideally not be reached because of AuthGuard, but it's good practice.
    return null;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Configuración de la Cuenta</CardTitle>
          <CardDescription>Gestiona los ajustes de tu perfil y la seguridad de tu cuenta.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Actualiza tu información personal.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-4">
                   <Avatar className="h-20 w-20">
                     <AvatarImage src={user.photoURL || undefined} />
                     <AvatarFallback>{user.displayName?.split(' ').map(n => n[0]).join('') || user.email?.[0].toUpperCase()}</AvatarFallback>
                   </Avatar>
                   <Button type="button" variant="outline" disabled>Cambiar Foto (Próximamente)</Button>
                </div>
                 <FormField
                  control={profileForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                    <Label>Correo Electrónico</Label>
                    <Input value={user.email || ""} disabled />
                    <p className="text-xs text-muted-foreground mt-1">El correo electrónico no se puede cambiar.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isProfileLoading}>
                  {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Password Card */}
        <Card>
           <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <CardHeader>
                <CardTitle>Contraseña</CardTitle>
                <CardDescription>Cambia tu contraseña. Se cerrará tu sesión actual por seguridad.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                 {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña Actual</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                 <Button type="submit" disabled={isPasswordLoading}>
                  {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cambiar Contraseña
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}

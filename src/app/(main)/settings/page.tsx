import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Configuración</CardTitle>
        <CardDescription>Ajustes generales de tu cuenta y la aplicación.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Esta sección está en construcción. Aquí podrás cambiar tu perfil, notificaciones y más.</p>
      </CardContent>
    </Card>
  );
}

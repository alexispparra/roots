import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="grid gap-6">
      <Card className="light-data-card">
        <CardHeader>
          <CardTitle className="font-headline">Reportes</CardTitle>
          <CardDescription>Análisis visual de tus finanzas y cashflow por proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
            <BarChart2 className="h-16 w-16 mb-4" />
          <p>Los reportes y gráficos ahora se generarán dentro de cada proyecto específico.</p>
        </CardContent>
      </Card>
    </div>
  );
}

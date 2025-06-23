import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Categorías Globales</CardTitle>
          <CardDescription>Esta sección se adaptará para la gestión de categorías por proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
            <LayoutGrid className="h-16 w-16 mb-4" />
          <p>Las categorías de gastos ahora se gestionarán dentro de cada proyecto específico.</p>
        </CardContent>
      </Card>
    </div>
  );
}

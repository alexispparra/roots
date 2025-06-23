import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const sheetData = [
  { id: 1, task: "Diseñar el flujo de registro", assignedTo: "Ana García", dueDate: "2024-08-15", status: "En Curso" },
  { id: 2, task: "Desarrollar componente de login", assignedTo: "Carlos Ruiz", dueDate: "2024-08-20", status: "Próximo" },
  { id: 3, task: "Configurar la base de datos", assignedTo: "Carlos Ruiz", dueDate: "2024-08-18", status: "En Curso" },
  { id: 4, task: "Crear mockups de la pantalla principal", assignedTo: "Ana García", dueDate: "2024-08-10", status: "Completado" },
  { id: 5, task: "Definir paleta de colores", assignedTo: "Ana García", dueDate: "2024-08-05", status: "Completado" },
  { id: 6, task: "Investigación de APIs de pago", assignedTo: "Luis Torres", dueDate: "2024-08-25", status: "Próximo" },
];

export default function GoogleSheetsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Datos de Google Sheets</CardTitle>
          <CardDescription>
            Visualización de datos desde tu hoja de cálculo conectada. (Simulado)
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sincronizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sheetData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.task}</TableCell>
                  <TableCell>{row.assignedTo}</TableCell>
                  <TableCell>{new Date(row.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={row.status === 'Completado' ? 'secondary' : 'default'} 
                      className={
                        row.status === 'En Curso' ? 'bg-blue-500/20 text-blue-700' : 
                        row.status === 'Próximo' ? 'bg-amber-500/20 text-amber-700' : ''
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Nota: Esta es una visualización con datos de ejemplo. Una integración completa con Google Sheets requiere autenticación y configuración de API.
        </p>
      </CardContent>
    </Card>
  );
}

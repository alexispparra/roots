import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getSheetData } from "@/services/google-sheets-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function GoogleSheetsPage() {
  const data = await getSheetData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Datos de Google Sheets</CardTitle>
          <CardDescription>
            Visualización de datos reales desde tu hoja de cálculo conectada.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sincronizar
        </Button>
      </CardHeader>
      <CardContent>
        {!data ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de Configuración</AlertTitle>
            <AlertDescription>
              No se pudieron obtener los datos. Por favor, asegúrate de que las variables de entorno de Google Sheets (`GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, y `GOOGLE_SHEETS_SHEET_ID`) están correctamente configuradas en tu archivo `.env`.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {data.header.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

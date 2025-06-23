"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { aiPrioritizeTasks, AIPrioritizeTasksOutput } from "@/ai/flows/prioritize-tasks";
import { Loader2 } from "lucide-react";

export default function PrioritizePage() {
  const [projectData, setProjectData] = useState("");
  const [googleSheetData, setGoogleSheetData] = useState("");
  const [result, setResult] = useState<AIPrioritizeTasksOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData || !googleSheetData) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa ambos campos de datos.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await aiPrioritizeTasks({ projectData, googleSheetData });
      setResult(response);
    } catch (error) {
      console.error("Error prioritizing tasks:", error);
      toast({
        title: "Error de la IA",
        description: "No se pudo procesar la solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Priorización con IA</CardTitle>
          <CardDescription>
            Usa la IA para analizar los datos de tu proyecto y la información de una Hoja de Cálculo de Google para priorizar tareas y obtener sugerencias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="projectData">Datos del Proyecto</Label>
              <Textarea
                id="projectData"
                placeholder="Pega aquí los datos de tu proyecto. Por ejemplo: Tareas, fechas límite, recursos..."
                value={projectData}
                onChange={(e) => setProjectData(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="googleSheetData">Datos de Google Sheets (pegar como CSV)</Label>
              <Textarea
                id="googleSheetData"
                placeholder="Copia las celdas de tu Google Sheet y pégalas aquí. Asegúrate de incluir los encabezados."
                value={googleSheetData}
                onChange={(e) => setGoogleSheetData(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                "Priorizar Tareas"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Resultados del Análisis</CardTitle>
            <CardDescription>La IA ha generado las siguientes prioridades y sugerencias.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div>
              <h3 className="font-semibold mb-2">Tareas Priorizadas</h3>
              <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">{result.prioritizedTasks}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sugerencias de Asignación de Recursos</h3>
              <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">{result.resourceAllocationSuggestions}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { aiPrioritizeTasks, AIPrioritizeTasksOutput } from "@/ai/flows/prioritize-tasks";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ListChecks, Recycle, Sparkles, Wand2 } from "lucide-react";

const formSchema = z.object({
  projectData: z.string().min(10, {
    message: "Project data must be at least 10 characters.",
  }),
  googleSheetData: z.string().min(10, {
    message: "Google Sheet data must be at least 10 characters.",
  }),
});

export default function PrioritizePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIPrioritizeTasksOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectData: "",
      googleSheetData: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const output = await aiPrioritizeTasks(values);
      setResult(output);
      toast({
        title: "Prioritization Complete",
        description: "AI analysis finished successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to prioritize tasks. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-accent"/>
            AI-Driven Task Prioritization
          </CardTitle>
          <CardDescription>
            Input your project and Google Sheets data to receive an AI-powered
            prioritization of tasks and resource allocation suggestions.
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="lg:col-span-2">
          <Card>
            <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your project data here, including tasks, deadlines, and resource allocation."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This data should give an overview of the current project state.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="googleSheetData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Sheet Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste relevant data from your Google Sheets, such as task details and manually set priorities."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide data from your tracking sheets for more accurate results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Analyzing..." : "Prioritize with AI"}
                <Wand2 className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      {loading && (
        <Card className="lg:col-span-2">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Sparkles className="h-12 w-12 animate-pulse text-accent"/>
                <p className="mt-4 text-lg font-medium">AI is analyzing your data...</p>
                <p className="text-muted-foreground">This may take a moment.</p>
            </CardContent>
        </Card>
      )}

      {result && (
        <div className="grid gap-6 lg:col-span-2 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <ListChecks className="text-primary"/>
                        Prioritized Tasks
                    </CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap text-sm">
                    {result.prioritizedTasks}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Recycle className="text-primary"/>
                        Resource Allocation Suggestions
                    </CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap text-sm">
                    {result.resourceAllocationSuggestions}
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

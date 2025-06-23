// prioritize-tasks.ts
'use server';
/**
 * @fileOverview AI-powered task prioritization flow.
 *
 * - aiPrioritizeTasks - A function that prioritizes tasks based on project data and Google Sheet inputs.
 * - AIPrioritizeTasksInput - The input type for the aiPrioritizeTasks function.
 * - AIPrioritizeTasksOutput - The return type for the aiPrioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPrioritizeTasksInputSchema = z.object({
  projectData: z.string().describe('Project data including tasks, deadlines, and resource allocation.'),
  googleSheetData: z.string().describe('Data from Google Sheets containing task details and priorities.'),
});
export type AIPrioritizeTasksInput = z.infer<typeof AIPrioritizeTasksInputSchema>;

const AIPrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z.string().describe('A list of tasks prioritized based on urgency and importance.'),
  resourceAllocationSuggestions: z
    .string()
    .describe('Suggestions for resource allocation to improve project efficiency.'),
});
export type AIPrioritizeTasksOutput = z.infer<typeof AIPrioritizeTasksOutputSchema>;

export async function aiPrioritizeTasks(input: AIPrioritizeTasksInput): Promise<AIPrioritizeTasksOutput> {
  return aiPrioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPrioritizeTasksPrompt',
  input: {schema: AIPrioritizeTasksInputSchema},
  output: {schema: AIPrioritizeTasksOutputSchema},
  prompt: `You are an AI project management assistant. Analyze the project data and Google Sheet inputs to prioritize tasks and suggest resource allocation.

Project Data: {{{projectData}}}
Google Sheet Data: {{{googleSheetData}}}

Prioritized Tasks: Prioritize tasks based on urgency and importance.
Resource Allocation Suggestions: Provide suggestions for resource allocation to improve project efficiency.`,
});

const aiPrioritizeTasksFlow = ai.defineFlow(
  {
    name: 'aiPrioritizeTasksFlow',
    inputSchema: AIPrioritizeTasksInputSchema,
    outputSchema: AIPrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

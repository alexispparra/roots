'use server';
/**
 * @fileOverview AI-powered task prioritization flow.
 * THIS FEATURE IS TEMPORARILY DISABLED to resolve dependency conflicts.
 */

import { z } from 'zod';

const AIPrioritizeTasksInputSchema = z.object({
  projectData: z.string(),
  googleSheetData: z.string(),
});
export type AIPrioritizeTasksInput = z.infer<typeof AIPrioritizeTasksInputSchema>;

const AIPrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z.string(),
  resourceAllocationSuggestions: z.string(),
});
export type AIPrioritizeTasksOutput = z.infer<typeof AIPrioritizeTasksOutputSchema>;

export async function aiPrioritizeTasks(input: AIPrioritizeTasksInput): Promise<AIPrioritizeTasksOutput> {
  console.warn("AI Prioritization is temporarily disabled.");
  // We throw an error here to make it clear in the UI that the feature is offline
  // The calling page should catch this and display a user-friendly message.
  throw new Error("AI_DISABLED");
}

// prioritize-tasks.ts
'use server';
/**
 * @fileOverview AI-powered task prioritization flow.
 *
 * - prioritizeTasks - A function that analyzes tasks and suggests an optimized order.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      description: z.string().describe('A detailed description of the task.'),
      deadline: z.string().describe('The deadline for the task (e.g., YYYY-MM-DD).'),
      estimatedTime: z
        .string()
        .describe('Estimated time to complete the task (e.g., 2 hours).'),
      priority: z.enum(['high', 'medium', 'low']).describe('Initial priority of the task.'),
    })
  ).describe('An array of tasks to be prioritized.'),
  userProfile: z
    .string()
    .describe('Information about the user, including their skills, availability, and preferences.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      reasoning: z.string().describe('Explanation for the task order.'),
    })
  ).describe('An array of tasks in the optimized order with reasoning.'),
});
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI assistant designed to optimize task lists for users based on their profile and task demands.

Analyze the following tasks and user profile, then provide an optimized order for completing the tasks.
Explain the reasoning behind the suggested order.

User Profile:
{{userProfile}}

Tasks:
{{#each tasks}}
- Name: {{this.name}}
  Description: {{this.description}}
  Deadline: {{this.deadline}}
  Estimated Time: {{this.estimatedTime}}
  Priority: {{this.priority}}
{{/each}}

Output the prioritized tasks with reasoning for each task's position in the prioritizedTasks array.
Ensure that tasks are not dropped, and that all original tasks are present in the output.
`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

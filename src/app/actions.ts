// src/app/actions.ts
"use server";

import { prioritizeTasks, type PrioritizeTasksInput, type PrioritizeTasksOutput } from "@/ai/flows/prioritize-tasks";
import type { Task, UserProfile } from "@/types";
import { format } from "date-fns";

export async function handlePrioritizeTasksAction(
  currentTasks: Task[],
  userProfile: UserProfile
): Promise<{ prioritizedTasks?: Task[]; error?: string }> {
  if (!currentTasks || currentTasks.length === 0) {
    return { error: "No tasks to prioritize." };
  }

  const tasksForAI: PrioritizeTasksInput["tasks"] = currentTasks.map((task) => ({
    name: task.name,
    description: task.description || "No description",
    deadline: task.deadline ? format(task.deadline, "yyyy-MM-dd") : "Not set",
    estimatedTime: task.estimatedTime || "Not set",
    priority: task.priority,
  }));

  const aiInput: PrioritizeTasksInput = {
    tasks: tasksForAI,
    userProfile: userProfile.details || "Default user profile: a busy professional looking for an optimized task list.",
  };

  try {
    const aiResult: PrioritizeTasksOutput = await prioritizeTasks(aiInput);
    
    const taskMapByName = new Map(currentTasks.map(task => [task.name, task]));
    
    const reorderedTasksWithDetails: Task[] = [];
    const tasksNotFoundAfterAI: string[] = [];

    aiResult.prioritizedTasks.forEach(aiTask => {
      const originalTask = taskMapByName.get(aiTask.name);
      if (originalTask) {
        reorderedTasksWithDetails.push({
          ...originalTask,
          aiReasoning: aiTask.reasoning, // Add reasoning from AI
        });
        taskMapByName.delete(aiTask.name); // Remove from map to track unprioritized tasks
      } else {
        tasksNotFoundAfterAI.push(aiTask.name);
      }
    });
    
    // Add any tasks that were in the original list but not in AI's prioritized list (should not happen based on prompt)
    // These will be added to the end.
    taskMapByName.forEach(unprioritizedTask => {
        reorderedTasksWithDetails.push({...unprioritizedTask, aiReasoning: "This task was not explicitly prioritized by AI."});
    });

    if (tasksNotFoundAfterAI.length > 0) {
      console.warn("AI did not return the following tasks:", tasksNotFoundAfterAI.join(", "));
      // Optionally return an error or partial success message
    }

    return { prioritizedTasks: reorderedTasksWithDetails };
  } catch (error) {
    console.error("Error during AI prioritization:", error);
    return { error: "Failed to prioritize tasks using AI. Please try again." };
  }
}

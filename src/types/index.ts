export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "completed";

export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: Date | null;
  estimatedTime: string;
  priority: TaskPriority;
  status: TaskStatus;
  aiReasoning?: string;
}

export interface UserProfile {
  details: string;
}

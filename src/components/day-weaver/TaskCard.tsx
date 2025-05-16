"use client";

import type { Task, TaskPriority } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TaskItemMenu } from "./TaskItemMenu";
import { format, isPast, isToday } from "date-fns";
import { CalendarDays, Clock3, ChevronUp, Minus, ChevronDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, task: Task) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
}

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  high: <ChevronUp className="h-4 w-4 text-red-500" />,
  medium: <Minus className="h-4 w-4 text-yellow-500" />,
  low: <ChevronDown className="h-4 w-4 text-green-500" />,
};

const priorityText: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function TaskCard({ task, onToggleComplete, onEdit, onDelete, onDragStart, onDragEnd }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  
  let deadlineBadge = null;
  if (task.deadline) {
    if (!isCompleted && isPast(task.deadline) && !isToday(task.deadline)) {
      deadlineBadge = <Badge variant="destructive">Overdue</Badge>;
    } else if (!isCompleted && isToday(task.deadline)) {
      deadlineBadge = <Badge variant="outline" className="border-yellow-500 text-yellow-600">Due Today</Badge>;
    }
  }

  return (
    <Card 
      draggable 
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={cn(
        "mb-4 shadow-xl hover:shadow-2xl transition-shadow cursor-grab backdrop-blur-lg border border-white/10 dark:border-white/5",
        isCompleted 
          ? "bg-muted bg-opacity-40 dark:bg-opacity-30 opacity-70" 
          : "bg-card bg-opacity-60 dark:bg-opacity-40"
      )}
      data-task-id={task.id}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-start space-x-3">
          <Checkbox
            id={`task-${task.id}`}
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1 shrink-0"
            aria-labelledby={`task-name-${task.id}`}
          />
          <div className="flex-grow">
            <CardTitle id={`task-name-${task.id}`} className={`text-lg ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
              {task.name}
            </CardTitle>
            {task.description && (
              <CardDescription className={`mt-1 ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                {task.description}
              </CardDescription>
            )}
          </div>
        </div>
        <TaskItemMenu onEdit={() => onEdit(task)} onDelete={() => onDelete(task.id)} />
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center mr-4" title={`Priority: ${priorityText[task.priority]}`}>
            {priorityIcons[task.priority]}
            <span className="ml-1 capitalize">{priorityText[task.priority]}</span>
          </div>
          {task.estimatedTime && (
            <div className="flex items-center mr-4" title={`Estimated time: ${task.estimatedTime}`}>
              <Clock3 className="h-4 w-4 mr-1" />
              <span>{task.estimatedTime}</span>
            </div>
          )}
        </div>
         {task.aiReasoning && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-start text-xs text-blue-600 bg-blue-50/70 dark:bg-blue-900/70 p-2 rounded-md border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                  <Info className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                  <p className="italic">{task.aiReasoning}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-card bg-opacity-80 dark:bg-opacity-60 backdrop-blur-md border-white/20 dark:border-neutral-700/30">
                <p>AI Prioritization Reasoning</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-0">
        <div>
          {task.deadline && (
            <div className="flex items-center" title={`Deadline: ${format(task.deadline, "PPP")}`}>
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>{format(task.deadline, "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
        {deadlineBadge}
      </CardFooter>
    </Card>
  );
}

"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  completedTasks: number;
  totalTasks: number;
}

export function DayWeaverProgressBar({ completedTasks, totalTasks }: ProgressBarProps) {
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="w-full my-6">
      {totalTasks > 0 ? (
        <>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-foreground">
              Daily Progress
            </p>
            <p className="text-sm text-muted-foreground">
              {completedTasks} / {totalTasks} tasks completed
            </p>
          </div>
          <Progress value={progressPercentage} className="w-full h-3" />
        </>
      ) : (
        <p className="text-sm text-center text-muted-foreground">Add tasks to see your progress.</p>
      )}
    </div>
  );
}

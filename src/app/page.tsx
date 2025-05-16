"use client";

import { useState, useEffect } from "react";
import type { Task, TaskPriority, UserProfile } from "@/types";
import { Header } from "@/components/day-weaver/Header";
import { TaskForm } from "@/components/day-weaver/TaskForm";
import { TaskList } from "@/components/day-weaver/TaskList";
import { DayWeaverProgressBar } from "@/components/day-weaver/ProgressBar";
import { AIPrioritizationDialog } from "@/components/day-weaver/AIPrioritizationDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wand2, Loader2 } from "lucide-react";
import { handlePrioritizeTasksAction } from "./actions";
import { useToast } from "@/hooks/use-toast";

export default function DayWeaverPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ details: "" });
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAIPrioritizationDialogOpen, setIsAIPrioritizationDialogOpen] = useState(false);
  const [isPrioritizingAI, setIsPrioritizingAI] = useState(false);
  const { toast } = useToast();

  // Load tasks from local storage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem("dayWeaverTasks");
    if (storedTasks) {
      try {
        const parsedTasks: Task[] = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          deadline: task.deadline ? new Date(task.deadline) : null,
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error("Failed to parse tasks from local storage:", error);
        localStorage.removeItem("dayWeaverTasks"); // Clear corrupted data
      }
    }
    const storedProfile = localStorage.getItem("dayWeaverUserProfile");
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error("Failed to parse user profile from local storage:", error);
        localStorage.removeItem("dayWeaverUserProfile");
      }
    }
  }, []);

  // Save tasks to local storage whenever tasks change
  useEffect(() => {
    localStorage.setItem("dayWeaverTasks", JSON.stringify(tasks));
  }, [tasks]);

  // Save user profile to local storage
  useEffect(() => {
    localStorage.setItem("dayWeaverUserProfile", JSON.stringify(userProfile));
  }, [userProfile]);


  const handleOpenTaskForm = (taskToEdit?: Task) => {
    setEditingTask(taskToEdit || null);
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = (
    data: { name: string; description?: string; deadline?: Date | null; estimatedTime?: string; priority: TaskPriority },
    existingTaskId?: string
  ) => {
    if (existingTaskId) {
      setTasks(
        tasks.map((task) =>
          task.id === existingTaskId ? { ...task, ...data, deadline: data.deadline || null } : task
        )
      );
      toast({ title: "Task Updated", description: `"${data.name}" has been updated.` });
    } else {
      const newTask: Task = {
        id: Date.now().toString(), // Simple ID generation
        ...data,
        deadline: data.deadline || null,
        status: "todo",
        aiReasoning: undefined, // Ensure aiReasoning is initially undefined
      };
      setTasks([newTask, ...tasks]); // Add new tasks to the beginning
      toast({ title: "Task Added", description: `"${data.name}" has been added.` });
    }
    handleCloseTaskForm();
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "completed" ? "todo" : "completed" }
          : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(tasks.filter((task) => task.id !== id));
    if (taskToDelete) {
      toast({ title: "Task Deleted", description: `"${taskToDelete.name}" has been deleted.`, variant: "destructive" });
    }
  };

  const handlePrioritizeTasks = async (profileDetails: string) => {
    setIsPrioritizingAI(true);
    const currentProfile = { ...userProfile, details: profileDetails };
    setUserProfile(currentProfile); // Update profile state

    const result = await handlePrioritizeTasksAction(tasks, currentProfile);
    setIsPrioritizingAI(false);

    if (result.prioritizedTasks) {
      setTasks(result.prioritizedTasks);
      toast({ title: "Tasks Prioritized", description: "Your tasks have been reordered by AI." });
      setIsAIPrioritizationDialogOpen(false); // Close dialog on success
    } else if (result.error) {
      toast({ title: "Prioritization Failed", description: result.error, variant: "destructive" });
    }
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
     toast({ title: "Tasks Reordered", description: "Task order has been manually updated." });
  };

  const completedTasksCount = tasks.filter((task) => task.status === "completed").length;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 selection:bg-primary/20">
      <Header />
      <main className="w-full max-w-3xl mt-4 md:mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg shadow-xl bg-card bg-opacity-60 dark:bg-opacity-40 backdrop-blur-lg border border-white/10 dark:border-white/5">
          <p className="text-muted-foreground text-center sm:text-left">
            Organize your day, achieve your goals.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenTaskForm()} variant="default" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
            <Button
              onClick={() => setIsAIPrioritizationDialogOpen(true)}
              variant="outline"
              size="sm"
              disabled={tasks.length === 0 || isPrioritizingAI}
            >
              {isPrioritizingAI ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              AI Prioritize
            </Button>
          </div>
        </div>

        <DayWeaverProgressBar completedTasks={completedTasksCount} totalTasks={tasks.length} />

        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleOpenTaskForm}
          onDelete={handleDeleteTask}
          onReorderTasks={handleReorderTasks}
        />
      </main>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
      />

      <AIPrioritizationDialog
        isOpen={isAIPrioritizationDialogOpen}
        onClose={() => setIsAIPrioritizationDialogOpen(false)}
        onPrioritize={handlePrioritizeTasks}
        isPrioritizing={isPrioritizingAI}
      />
      
      <footer className="w-full max-w-3xl text-center py-8 mt-auto">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Day Weaver. Weave your perfect day.
        </p>
      </footer>
    </div>
  );
}

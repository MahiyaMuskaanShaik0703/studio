"use client";

import * as React from "react";
import type { Task, TaskPriority } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const taskFormSchema = z.object({
  name: z.string().min(1, "Task name is required."),
  description: z.string().optional(),
  deadline: z.date().nullable().optional(),
  estimatedTime: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues, existingTaskId?: string) => void;
  initialData?: Task | null;
}

const inputTextAreaBaseClass = "bg-background/50 dark:bg-background/30 border-white/20 dark:border-neutral-700/40 focus:border-primary/50";

export function TaskForm({ isOpen, onClose, onSubmit, initialData }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          deadline: initialData.deadline,
          estimatedTime: initialData.estimatedTime,
          priority: initialData.priority,
        }
      : {
          name: "",
          description: "",
          deadline: null,
          estimatedTime: "",
          priority: "medium",
        },
  });

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit(data, initialData?.id);
    form.reset(); // Reset form after submission
  };

  // Reset form when initialData changes (e.g., opening dialog for new vs edit)
  React.useEffect(() => {
    if (isOpen) {
      form.reset(initialData
        ? {
            name: initialData.name,
            description: initialData.description,
            deadline: initialData.deadline,
            estimatedTime: initialData.estimatedTime,
            priority: initialData.priority,
          }
        : {
            name: "",
            description: "",
            deadline: null,
            estimatedTime: "",
            priority: "medium",
          });
    }
  }, [isOpen, initialData, form]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card bg-opacity-70 dark:bg-opacity-50 backdrop-blur-xl shadow-2xl border border-white/10 dark:border-white/5">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Finish project report" {...field} className={inputTextAreaBaseClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about the task..." {...field} className={inputTextAreaBaseClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              inputTextAreaBaseClass,
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 bg-popover/80 dark:bg-popover/70 backdrop-blur-md border-white/20 dark:border-neutral-700/30" 
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Time (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., 2 hours" {...field} className={inputTextAreaBaseClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={inputTextAreaBaseClass}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover/80 dark:bg-popover/70 backdrop-blur-md border-white/20 dark:border-neutral-700/30">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{initialData ? "Save Changes" : "Add Task"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

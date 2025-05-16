"use client";

import type { Task } from "@/types";
import { TaskCard } from "./TaskCard";
import React, { useState } from "react";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorderTasks: (reorderedTasks: Task[]) => void;
}

export function TaskList({ tasks, onToggleComplete, onEdit, onDelete, onReorderTasks }: TaskListProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id); // For Firefox compatibility
     // Minimal drag image
    const empty = document.createElement('div');
    event.dataTransfer.setDragImage(empty, 0, 0);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, targetTask: Task) => {
    event.preventDefault();
    if (draggedTask && draggedTask.id !== targetTask.id) {
      setDragOverTaskId(targetTask.id);
    }
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>, targetTask: Task) => {
    event.preventDefault();
     if (draggedTask && draggedTask.id !== targetTask.id) {
      setDragOverTaskId(targetTask.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverTaskId(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, dropTargetTask: Task) => {
    event.preventDefault();
    if (!draggedTask || draggedTask.id === dropTargetTask.id) {
      setDraggedTask(null);
      setDragOverTaskId(null);
      return;
    }

    const tasksCopy = [...tasks];
    const draggedItemIndex = tasksCopy.findIndex(t => t.id === draggedTask.id);
    const dropTargetIndex = tasksCopy.findIndex(t => t.id === dropTargetTask.id);

    if (draggedItemIndex === -1 || dropTargetIndex === -1) return;

    const [removed] = tasksCopy.splice(draggedItemIndex, 1);
    tasksCopy.splice(dropTargetIndex, 0, removed);
    
    onReorderTasks(tasksCopy);
    setDraggedTask(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverTaskId(null);
  };
  
  // This outer drop zone handles dropping into an empty list or at the end.
  const handleOuterDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggedTask && tasks.every(t => t.id !== draggedTask.id)) { // If dragged from outside or list is empty
        // This case is not handled for simplicity, assumes D&D is within the list
    } else if (draggedTask && tasks.length > 0 && !event.currentTarget.querySelector(`[data-task-id="${dragOverTaskId}"]`)) {
        // Dropping at the end of the list
        const tasksCopy = tasks.filter(t => t.id !== draggedTask.id);
        tasksCopy.push(draggedTask);
        onReorderTasks(tasksCopy);
    }
    setDraggedTask(null);
    setDragOverTaskId(null);
  };


  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground text-lg">No tasks yet. Add a task to get started!</p>
        <img src="https://placehold.co/300x200.png" alt="Empty task list illustration" data-ai-hint="empty illustration" className="mt-4 mx-auto opacity-50 rounded-md"/>
      </div>
    );
  }

  return (
    <div 
        className="space-y-0" 
        onDragOver={(e) => {e.preventDefault(); e.dataTransfer.dropEffect = "move";}} // Allow drop on the container itself
        onDrop={handleOuterDrop} // Handle drop on empty space or at the end
    >
      {tasks.map((task, index) => (
        <div
          key={task.id}
          onDragOver={(e) => handleDragOver(e, task)}
          onDrop={(e) => handleDrop(e, task)}
          onDragEnter={(e) => handleDragEnter(e, task)}
          onDragLeave={handleDragLeave}
          className={`transition-all duration-150 ease-in-out 
                      ${dragOverTaskId === task.id && draggedTask && draggedTask.id !== task.id ? 
                        (tasks.findIndex(t => t.id === draggedTask.id) < index ? 'pt-[60px]' : 'pb-[60px]') 
                        : ''}
                      ${draggedTask?.id === task.id ? 'opacity-50' : ''}
                     `}
        >
          <TaskCard
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={(e, t) => handleDragStart(e, t)}
            onDragEnd={handleDragEnd}
          />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { moveTask } from "@/actions/projects";
import { toast } from "sonner";
import type { ProjectTask, TaskStatus } from "@/types";
import { TASK_STATUSES } from "@/lib/constants";

interface KanbanBoardProps {
  projectId: string;
  tasks: ProjectTask[];
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanBoard({ projectId, tasks, onEditTask, onDeleteTask }: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  // Group tasks by status
  const tasksByStatus = TASK_STATUSES.reduce((acc, { value }) => {
    acc[value] = localTasks
      .filter((task) => (task.status ?? "todo") === value)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return acc;
  }, {} as Record<TaskStatus, ProjectTask[]>);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    // Optimistic update
    setLocalTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      const updated = prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: destStatus, completed: destStatus === "complete" || destStatus === "shipped" };
        }
        return t;
      });

      return updated;
    });

    try {
      await moveTask(taskId, projectId, destStatus, destination.index);
    } catch (error) {
      // Revert on error
      setLocalTasks(tasks);
      toast.error("Failed to move task");
      console.error(error);
    }
  }, [projectId, tasks]);

  // Sync local tasks when props change
  if (tasks !== localTasks && JSON.stringify(tasks) !== JSON.stringify(localTasks)) {
    // Only update if tasks actually changed from server
    const tasksChanged = tasks.some((t, i) => {
      const local = localTasks.find((lt) => lt.id === t.id);
      return !local || local.status !== t.status || local.sortOrder !== t.sortOrder;
    });
    if (tasksChanged || tasks.length !== localTasks.length) {
      setLocalTasks(tasks);
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_STATUSES.map(({ value }) => (
          <KanbanColumn
            key={value}
            status={value}
            tasks={tasksByStatus[value] ?? []}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

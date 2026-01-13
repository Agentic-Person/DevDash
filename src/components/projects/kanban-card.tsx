"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import type { ProjectTask, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: ProjectTask;
  index: number;
  onEdit: (task: ProjectTask) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const priorityBorders: Record<TaskPriority, string> = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-gray-400",
};

export function KanbanCard({ task, index, onEdit, onDelete }: KanbanCardProps) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && !task.completed;
  const isDueToday = dueDate && isToday(dueDate);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "mb-2 border-l-4 cursor-grab active:cursor-grabbing transition-shadow",
            priorityBorders[task.priority],
            snapshot.isDragging && "shadow-lg ring-2 ring-primary/20"
          )}
        >
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className={cn(
                "text-sm font-medium leading-tight flex-1",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              {task.category && task.category !== "General" && (
                <Badge variant="secondary" className="text-xs">
                  {task.category}
                </Badge>
              )}
            </div>

            {dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue && "text-red-600 dark:text-red-400",
                isDueToday && "text-orange-600 dark:text-orange-400",
                !isOverdue && !isDueToday && "text-muted-foreground"
              )}>
                <CalendarIcon className="h-3 w-3" />
                {format(dueDate, "MMM d")}
                {isOverdue && " (overdue)"}
                {isDueToday && " (today)"}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}

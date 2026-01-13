"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./kanban-card";
import type { ProjectTask, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
import { TASK_STATUSES } from "@/lib/constants";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: ProjectTask[];
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({ status, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const statusConfig = TASK_STATUSES.find((s) => s.value === status);
  const label = statusConfig?.label ?? status;
  const color = statusConfig?.color ?? "bg-gray-500";

  return (
    <Card className="flex-1 min-w-[250px] max-w-[320px] flex flex-col bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            {label}
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <CardContent
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 min-h-[200px] p-2 pt-0 transition-colors",
              snapshot.isDraggingOver && "bg-primary/5"
            )}
          >
            <div className="space-y-0">
              {tasks.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
              {provided.placeholder}
            </div>
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Drop tasks here
              </div>
            )}
          </CardContent>
        )}
      </Droppable>
    </Card>
  );
}

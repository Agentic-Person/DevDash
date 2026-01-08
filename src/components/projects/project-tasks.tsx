"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  reorderTasks,
} from "@/actions/projects";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  ListTodo,
  X,
  Check,
  GripVertical,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import type { ProjectTask, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().nullable().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface ProjectTasksProps {
  projectId: string;
  tasks: ProjectTask[];
}

const priorityColors: Record<TaskPriority, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function ProjectTasks({ projectId, tasks }: ProjectTasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<TaskFormData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  // Keep local tasks in sync with props
  if (JSON.stringify(tasks) !== JSON.stringify(localTasks) && !isLoading) {
    setLocalTasks(tasks);
  }

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      priority: "medium",
      dueDate: null,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    try {
      await createTask(projectId, {
        title: data.title,
        priority: data.priority as TaskPriority,
        dueDate: data.dueDate,
      });
      toast.success("Task added");
      form.reset();
      setIsAdding(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    setIsLoading(true);
    try {
      await toggleTaskComplete(taskId, projectId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (taskId: string) => {
    if (!editData || !editData.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    setIsLoading(true);
    try {
      await updateTask(taskId, projectId, {
        title: editData.title,
        priority: editData.priority as TaskPriority,
        dueDate: editData.dueDate,
      });
      toast.success("Task updated");
      setEditingId(null);
      setEditData(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    setDeletingId(taskId);
    try {
      await deleteTask(taskId, projectId);
      toast.success("Task deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (task: ProjectTask) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate ? String(task.dueDate).split("T")[0] : null,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistic update
    setLocalTasks(items);

    try {
      await reorderTasks(
        projectId,
        items.map((t) => t.id)
      );
    } catch (error) {
      // Revert on error
      setLocalTasks(tasks);
      toast.error("Failed to reorder tasks");
    }
  };

  const incompleteTasks = localTasks.filter((t) => !t.completed);
  const completedTasks = localTasks.filter((t) => t.completed);

  const renderTask = (task: ProjectTask, index: number, isDraggable: boolean) => {
    const isOverdue =
      task.dueDate && !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

    const taskContent = (
      <div
        className={cn(
          "p-3 border rounded-lg",
          task.completed && "bg-muted/50"
        )}
      >
        {editingId === task.id && editData ? (
          <div className="space-y-3">
            <Input
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              placeholder="Task title"
            />
            <div className="flex gap-2">
              <Select
                value={editData.priority}
                onValueChange={(val) =>
                  setEditData({ ...editData, priority: val as TaskPriority })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {editData.dueDate
                      ? format(new Date(editData.dueDate), "MMM d")
                      : "Due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      editData.dueDate ? new Date(editData.dueDate) : undefined
                    }
                    onSelect={(date) =>
                      setEditData({
                        ...editData,
                        dueDate: date ? format(date, "yyyy-MM-dd") : null,
                      })
                    }
                  />
                  {editData.dueDate && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          setEditData({ ...editData, dueDate: null })
                        }
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleEdit(task.id)}
                disabled={isLoading}
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            {isDraggable && (
              <div className="mt-0.5 cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggleComplete(task.id)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", priorityColors[task.priority])}
                >
                  {task.priority}
                </Badge>
                {task.dueDate && (
                  <span
                    className={cn(
                      "text-xs",
                      isOverdue
                        ? "text-red-600 dark:text-red-400 font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {isOverdue && "Overdue: "}
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => startEditing(task)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(task.id)}
                disabled={deletingId === task.id}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );

    if (isDraggable) {
      return (
        <Draggable key={task.id} draggableId={task.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              {taskContent}
            </div>
          )}
        </Draggable>
      );
    }

    return <div key={task.id}>{taskContent}</div>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5" />
          Tasks
          {localTasks.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({completedTasks.length}/{localTasks.length})
            </span>
          )}
        </CardTitle>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 p-3 border rounded-lg bg-muted/50"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 flex-wrap">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {field.value
                                ? format(new Date(field.value), "MMM d")
                                : "Due date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : null
                              )
                            }
                          />
                          {field.value && (
                            <div className="p-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => field.onChange(null)}
                              >
                                Clear date
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Task"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}

        {localTasks.length === 0 && !isAdding ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add tasks to track what needs to be done.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Incomplete tasks - draggable */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {incompleteTasks.map((task, index) =>
                      renderTask(task, index, true)
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Completed tasks - not draggable */}
            {completedTasks.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground font-medium">
                  Completed ({completedTasks.length})
                </p>
                {completedTasks.map((task, index) =>
                  renderTask(task, index, false)
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ProjectFormData, ProjectFilters, ProjectSort, TaskFormData } from "@/types";
import type { Prisma } from "@prisma/client";

export async function getProjects(
  filters?: ProjectFilters,
  sort?: ProjectSort,
  includeArchived = false
) {
  const where: Prisma.ProjectWhereInput = {};

  // Apply archived filter
  if (!includeArchived) {
    where.isArchived = false;
  }

  // Apply filters
  if (filters?.dev_stage && filters.dev_stage !== "all") {
    where.devStage = filters.dev_stage;
  }
  if (filters?.project_type && filters.project_type !== "all") {
    where.projectType = filters.project_type;
  }
  if (filters?.priority && filters.priority !== "all") {
    where.priority = filters.priority;
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }
  // Filter by tag name
  if (filters?.tags && filters.tags.length > 0) {
    where.tags = {
      some: {
        tag: {
          name: { in: filters.tags },
        },
      },
    };
  }

  // Map sort field from snake_case to camelCase
  const sortFieldMap: Record<string, string> = {
    last_activity_at: "lastActivityAt",
    created_at: "createdAt",
    updated_at: "updatedAt",
    name: "name",
    deadline: "deadline",
    priority: "priority",
  };

  const sortField = sortFieldMap[sort?.field ?? "last_activity_at"] ?? "lastActivityAt";
  const sortDirection = sort?.direction ?? "desc";

  const data = await prisma.project.findMany({
    where,
    orderBy: { [sortField]: sortDirection },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Transform to include tags directly
  return data.map((project) => ({
    ...project,
    tags: project.tags.map((pt) => pt.tag),
  }));
}

export async function getProject(id: string) {
  const data = await prisma.project.findUnique({
    where: { id },
    include: {
      links: true,
      notes: true,
      tasks: {
        orderBy: [{ completed: "asc" }, { sortOrder: "asc" }],
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!data) {
    throw new Error("Project not found");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    devStage: data.devStage,
    marketingStage: data.marketingStage,
    projectType: data.projectType,
    priority: data.priority,
    deadline: data.deadline?.toISOString() ?? null,
    isArchived: data.isArchived,
    lastActivityAt: data.lastActivityAt.toISOString(),
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
    links: data.links ?? [],
    notes: data.notes ?? [],
    tasks: data.tasks?.map((task) => ({
      ...task,
      priority: task.priority as "low" | "medium" | "high",
      dueDate: task.dueDate?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })) ?? [],
    tags: data.tags?.map((pt) => pt.tag) ?? [],
  };
}

export async function createProject(formData: ProjectFormData) {
  const data = await prisma.project.create({
    data: {
      name: formData.name,
      description: formData.description ?? null,
      devStage: formData.dev_stage,
      marketingStage: formData.marketing_stage ?? null,
      projectType: formData.project_type,
      priority: formData.priority,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
    },
  });

  revalidatePath("/");
  return data;
}

export async function updateProject(id: string, formData: Partial<ProjectFormData>) {
  const updateData: Prisma.ProjectUpdateInput = {
    lastActivityAt: new Date(),
  };

  if (formData.name !== undefined) {
    updateData.name = formData.name;
  }
  if (formData.description !== undefined) {
    updateData.description = formData.description ?? null;
  }
  if (formData.dev_stage !== undefined) {
    updateData.devStage = formData.dev_stage;
  }
  if (formData.marketing_stage !== undefined) {
    updateData.marketingStage = formData.marketing_stage ?? null;
  }
  if (formData.project_type !== undefined) {
    updateData.projectType = formData.project_type;
  }
  if (formData.priority !== undefined) {
    updateData.priority = formData.priority;
  }
  if (formData.deadline !== undefined) {
    updateData.deadline = formData.deadline ? new Date(formData.deadline) : null;
  }

  const data = await prisma.project.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath(`/projects/${id}`);
  return data;
}

export async function deleteProject(id: string) {
  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function archiveProject(id: string, archive = true) {
  await prisma.project.update({
    where: { id },
    data: {
      isArchived: archive,
      lastActivityAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/archive");
}

// Link actions
export async function createLink(projectId: string, data: { label: string; url: string }) {
  const link = await prisma.projectLink.create({
    data: {
      projectId,
      label: data.label,
      url: data.url,
    },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  return link;
}

export async function deleteLink(id: string, projectId: string) {
  await prisma.projectLink.delete({
    where: { id },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
}

// Note actions
export async function createNote(projectId: string, content: string) {
  const note = await prisma.projectNote.create({
    data: {
      projectId,
      content,
    },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  return note;
}

export async function updateNote(id: string, projectId: string, content: string) {
  const note = await prisma.projectNote.update({
    where: { id },
    data: { content },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  return note;
}

export async function deleteNote(id: string, projectId: string) {
  await prisma.projectNote.delete({
    where: { id },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
}

// Tag actions
export async function getTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTag(name: string) {
  const tag = await prisma.tag.create({
    data: { name: name.trim() },
  });

  revalidatePath("/");
  return tag;
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function addTagToProject(projectId: string, tagId: string) {
  await prisma.projectTag.create({
    data: { projectId, tagId },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function removeTagFromProject(projectId: string, tagId: string) {
  await prisma.projectTag.delete({
    where: {
      projectId_tagId: { projectId, tagId },
    },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

// Task actions
export async function createTask(projectId: string, data: TaskFormData) {
  // Get max sortOrder for this project
  const maxOrder = await prisma.projectTask.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  const task = await prisma.projectTask.create({
    data: {
      projectId,
      title: data.title,
      priority: data.priority,
      category: data.category ?? "General",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  return {
    ...task,
    priority: task.priority as "low" | "medium" | "high",
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function updateTask(id: string, projectId: string, data: Partial<TaskFormData>) {
  const updateData: Prisma.ProjectTaskUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.priority !== undefined) {
    updateData.priority = data.priority;
  }
  if (data.category !== undefined) {
    updateData.category = data.category;
  }
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  const task = await prisma.projectTask.update({
    where: { id },
    data: updateData,
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  return {
    ...task,
    priority: task.priority as "low" | "medium" | "high",
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function toggleTaskComplete(id: string, projectId: string) {
  const task = await prisma.projectTask.findUnique({ where: { id } });
  if (!task) throw new Error("Task not found");

  const updated = await prisma.projectTask.update({
    where: { id },
    data: { completed: !task.completed },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  return {
    ...updated,
    dueDate: updated.dueDate?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteTask(id: string, projectId: string) {
  await prisma.projectTask.delete({
    where: { id },
  });

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function reorderTasks(projectId: string, taskIds: string[]) {
  // Update sortOrder for each task based on position in array
  await Promise.all(
    taskIds.map((id, index) =>
      prisma.projectTask.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function bulkCreateTasks(
  projectId: string,
  tasks: { title: string; category?: string }[]
) {
  // Get max sortOrder for this project
  const maxOrder = await prisma.projectTask.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  const startOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  // Create all tasks
  const createdTasks = await Promise.all(
    tasks.map((task, index) =>
      prisma.projectTask.create({
        data: {
          projectId,
          title: task.title,
          priority: "medium",
          category: task.category ?? "General",
          sortOrder: startOrder + index,
        },
      })
    )
  );

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  return createdTasks.map((task) => ({
    ...task,
    priority: task.priority as "low" | "medium" | "high",
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));
}

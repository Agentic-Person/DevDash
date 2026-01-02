"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ProjectFormData, ProjectFilters, ProjectSort } from "@/types";
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
  });

  return data;
}

export async function getProject(id: string) {
  const data = await prisma.project.findUnique({
    where: { id },
    include: {
      links: true,
      notes: true,
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

"use server";

import { prisma } from "@/lib/prisma";

export async function exportAllData() {
  const projects = await prisma.project.findMany({
    include: {
      links: true,
      notes: true,
    },
  });

  return {
    exportDate: new Date().toISOString(),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      devStage: p.devStage,
      marketingStage: p.marketingStage,
      projectType: p.projectType,
      priority: p.priority,
      deadline: p.deadline?.toISOString() ?? null,
      isArchived: p.isArchived,
      lastActivityAt: p.lastActivityAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      links: p.links,
      notes: p.notes,
    })),
  };
}

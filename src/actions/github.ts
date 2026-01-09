"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseMarkdownTasks } from "@/lib/task-parser";
import crypto from "crypto";

// Generate a random webhook secret
export async function generateWebhookSecret(): Promise<string> {
  return crypto.randomBytes(32).toString("hex");
}

// Update project GitHub settings
export async function updateGitHubSettings(
  projectId: string,
  data: { githubRepo?: string | null; githubSecret?: string | null }
) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepo: data.githubRepo,
      githubSecret: data.githubSecret,
      lastActivityAt: new Date(),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return project;
}

// Fetch TASKS.md from GitHub and sync tasks
export async function syncTasksFromGitHub(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: true },
  });

  if (!project || !project.githubRepo) {
    throw new Error("Project not found or GitHub repo not configured");
  }

  // Fetch TASKS.md from GitHub API
  const [owner, repo] = project.githubRepo.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid GitHub repo format. Use: owner/repo");
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/TASKS.md`;

  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "DevDash",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("TASKS.md not found in repository root");
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const markdown = await response.text();
  const parsedTasks = parseMarkdownTasks(markdown);

  // Get existing tasks for comparison
  const existingTasks = project.tasks;
  const existingTaskTitles = new Map(
    existingTasks.map((t) => [t.title.toLowerCase(), t])
  );

  // Determine which tasks to create, update, or leave alone
  const tasksToCreate: { title: string; category: string; completed: boolean }[] = [];
  const tasksToUpdate: { id: string; completed: boolean; category: string }[] = [];

  for (const parsed of parsedTasks) {
    const existing = existingTaskTitles.get(parsed.title.toLowerCase());

    if (existing) {
      // Task exists - check if we need to update completion status
      if (existing.completed !== parsed.completed || existing.category !== (parsed.category || "General")) {
        tasksToUpdate.push({
          id: existing.id,
          completed: parsed.completed,
          category: parsed.category || "General",
        });
      }
    } else {
      // New task
      tasksToCreate.push({
        title: parsed.title,
        category: parsed.category || "General",
        completed: parsed.completed,
      });
    }
  }

  // Get max sortOrder for new tasks
  const maxOrder = await prisma.projectTask.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });
  let sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  // Create new tasks
  if (tasksToCreate.length > 0) {
    await prisma.projectTask.createMany({
      data: tasksToCreate.map((task) => ({
        projectId,
        title: task.title,
        category: task.category,
        completed: task.completed,
        priority: "medium",
        sortOrder: sortOrder++,
      })),
    });
  }

  // Update existing tasks
  for (const task of tasksToUpdate) {
    await prisma.projectTask.update({
      where: { id: task.id },
      data: {
        completed: task.completed,
        category: task.category,
      },
    });
  }

  // Update project activity
  await prisma.project.update({
    where: { id: projectId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/projects/${projectId}`);

  return {
    created: tasksToCreate.length,
    updated: tasksToUpdate.length,
    total: parsedTasks.length,
  };
}

// Find project by GitHub repo
export async function findProjectByGitHubRepo(repo: string) {
  return prisma.project.findFirst({
    where: { githubRepo: repo },
  });
}

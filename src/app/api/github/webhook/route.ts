import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseMarkdownTasks } from "@/lib/task-parser";
import { decrypt, isEncrypted } from "@/lib/crypto";
import crypto from "crypto";

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256") || "";

    // Parse the payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Get repository info from payload
    const repoFullName = payload.repository?.full_name;
    if (!repoFullName) {
      return NextResponse.json({ error: "Missing repository info" }, { status: 400 });
    }

    // Find project by GitHub repo
    const project = await prisma.project.findFirst({
      where: { githubRepo: repoFullName },
      include: { tasks: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "No project found for this repository" },
        { status: 404 }
      );
    }

    // Verify webhook signature if secret is configured
    if (project.githubSecret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }

      // Decrypt the secret before verification
      let secret: string;
      try {
        secret = isEncrypted(project.githubSecret)
          ? decrypt(project.githubSecret)
          : project.githubSecret; // Handle legacy unencrypted secrets
      } catch {
        return NextResponse.json({ error: "Failed to decrypt secret" }, { status: 500 });
      }

      if (!verifySignature(body, signature, secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // Fetch TASKS.md from GitHub
    const apiUrl = `https://api.github.com/repos/${repoFullName}/contents/TASKS.md`;
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "DevDash",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        // TASKS.md doesn't exist, that's okay
        return NextResponse.json({ message: "No TASKS.md found, skipping sync" });
      }
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: 502 }
      );
    }

    const markdown = await response.text();
    const parsedTasks = parseMarkdownTasks(markdown);

    // Get existing tasks for comparison
    const existingTaskTitles = new Map(
      project.tasks.map((t) => [t.title.toLowerCase(), t])
    );

    // Determine tasks to create and update
    const tasksToCreate: { title: string; category: string; completed: boolean }[] = [];
    const tasksToUpdate: { id: string; completed: boolean; category: string }[] = [];

    for (const parsed of parsedTasks) {
      const existing = existingTaskTitles.get(parsed.title.toLowerCase());

      if (existing) {
        if (existing.completed !== parsed.completed || existing.category !== (parsed.category || "General")) {
          tasksToUpdate.push({
            id: existing.id,
            completed: parsed.completed,
            category: parsed.category || "General",
          });
        }
      } else {
        tasksToCreate.push({
          title: parsed.title,
          category: parsed.category || "General",
          completed: parsed.completed,
        });
      }
    }

    // Get max sortOrder for new tasks
    const maxOrder = await prisma.projectTask.aggregate({
      where: { projectId: project.id },
      _max: { sortOrder: true },
    });
    let sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    // Create new tasks
    if (tasksToCreate.length > 0) {
      await prisma.projectTask.createMany({
        data: tasksToCreate.map((task) => ({
          projectId: project.id,
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
      where: { id: project.id },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({
      message: "Sync complete",
      created: tasksToCreate.length,
      updated: tasksToUpdate.length,
      total: parsedTasks.length,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

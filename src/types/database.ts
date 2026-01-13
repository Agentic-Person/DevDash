export type DevStage =
  | "idea"
  | "planning"
  | "in_development"
  | "testing"
  | "demo_ready"
  | "launched"
  | "maintained";

export type MarketingStage = "script" | "video" | "social_media" | "done";

export type ProjectType =
  | "web_app"
  | "mobile_app"
  | "cli_tool"
  | "library"
  | "api"
  | "other";

export type PriorityLevel = "low" | "medium" | "high" | "critical";

export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "todo" | "in_development" | "testing" | "complete" | "shipped";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  devStage: string;
  marketingStage: string | null;
  projectType: string;
  priority: string;
  deadline: Date | string | null;
  isArchived: boolean;
  githubRepo: string | null;
  githubSecret: string | null;
  lastActivityAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  label: string;
  url: string;
  createdAt: Date | string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date | string;
}

export interface ProjectTag {
  projectId: string;
  tagId: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: Date | string | null;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

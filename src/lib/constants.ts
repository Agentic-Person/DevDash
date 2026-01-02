import type { DevStage, MarketingStage, ProjectType, PriorityLevel } from "@/types";

// Dev Stage configuration
export const DEV_STAGES: { value: DevStage; label: string; color: string }[] = [
  { value: "idea", label: "Idea", color: "bg-gray-500" },
  { value: "planning", label: "Planning", color: "bg-blue-500" },
  { value: "in_development", label: "In Development", color: "bg-yellow-500" },
  { value: "testing", label: "Testing", color: "bg-orange-500" },
  { value: "demo_ready", label: "Demo Ready", color: "bg-purple-500" },
  { value: "launched", label: "Launched", color: "bg-green-500" },
  { value: "maintained", label: "Maintained", color: "bg-teal-500" },
];

// Marketing Stage configuration
export const MARKETING_STAGES: { value: MarketingStage; label: string; color: string }[] = [
  { value: "script", label: "Script", color: "bg-slate-500" },
  { value: "video", label: "Video", color: "bg-indigo-500" },
  { value: "social_media", label: "Social Media", color: "bg-pink-500" },
  { value: "done", label: "Done", color: "bg-emerald-500" },
];

// Stages that are eligible for marketing
export const MARKETING_ELIGIBLE_STAGES: DevStage[] = [
  "demo_ready",
  "launched",
  "maintained",
];

// Project Type configuration
export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "web_app", label: "Web App" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "cli_tool", label: "CLI Tool" },
  { value: "library", label: "Library" },
  { value: "api", label: "API" },
  { value: "other", label: "Other" },
];

// Priority configuration
export const PRIORITIES: { value: PriorityLevel; label: string; borderColor: string }[] = [
  { value: "low", label: "Low", borderColor: "border-l-gray-400" },
  { value: "medium", label: "Medium", borderColor: "border-l-blue-400" },
  { value: "high", label: "High", borderColor: "border-l-orange-400" },
  { value: "critical", label: "Critical", borderColor: "border-l-red-500" },
];

// Helper functions
export function getDevStageConfig(stage: DevStage) {
  return DEV_STAGES.find((s) => s.value === stage) ?? DEV_STAGES[0];
}

export function getMarketingStageConfig(stage: MarketingStage) {
  return MARKETING_STAGES.find((s) => s.value === stage) ?? MARKETING_STAGES[0];
}

export function getProjectTypeConfig(type: ProjectType) {
  return PROJECT_TYPES.find((t) => t.value === type) ?? PROJECT_TYPES[0];
}

export function getPriorityConfig(priority: PriorityLevel) {
  return PRIORITIES.find((p) => p.value === priority) ?? PRIORITIES[1];
}

export function isMarketingEligible(stage: DevStage): boolean {
  return MARKETING_ELIGIBLE_STAGES.includes(stage);
}

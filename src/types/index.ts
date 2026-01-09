export type {
  DevStage,
  MarketingStage,
  ProjectType,
  PriorityLevel,
  TaskPriority,
  Project,
  ProjectLink,
  ProjectNote,
  ProjectTask,
  Tag,
  ProjectTag,
} from "./database";

// Extended types with relations
export interface ProjectWithRelations {
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
  links?: import("./database").ProjectLink[];
  notes?: import("./database").ProjectNote[];
  tasks?: import("./database").ProjectTask[];
  tags?: import("./database").Tag[];
}

// Form types (use snake_case to match form field names)
export interface ProjectFormData {
  name: string;
  description?: string;
  dev_stage: import("./database").DevStage;
  marketing_stage?: import("./database").MarketingStage | null;
  project_type: import("./database").ProjectType;
  priority: import("./database").PriorityLevel;
  deadline?: string | null;
}

export interface LinkFormData {
  label: string;
  url: string;
}

export interface NoteFormData {
  content: string;
}

export interface TagFormData {
  name: string;
}

export interface TaskFormData {
  title: string;
  priority: import("./database").TaskPriority;
  category?: string;
  dueDate?: string | null;
}

// Filter types
export interface ProjectFilters {
  search?: string;
  dev_stage?: import("./database").DevStage | "all";
  project_type?: import("./database").ProjectType | "all";
  priority?: import("./database").PriorityLevel | "all";
  tags?: string[];
}

// Sort options
export type ProjectSortField =
  | "name"
  | "created_at"
  | "updated_at"
  | "last_activity_at"
  | "deadline"
  | "priority";

export type SortDirection = "asc" | "desc";

export interface ProjectSort {
  field: ProjectSortField;
  direction: SortDirection;
}

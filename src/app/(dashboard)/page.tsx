import { Suspense } from "react";
import { getProjects } from "@/actions/projects";
import { ProjectGrid } from "@/components/projects/project-grid";
import { ProjectFilters } from "@/components/projects/project-filters";
import { QuickAddModal } from "@/components/projects/quick-add-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { DevStage, ProjectType, PriorityLevel } from "@/types";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    stage?: string;
    type?: string;
    priority?: string;
    tag?: string;
  }>;
}

async function ProjectList({
  searchParams,
}: {
  searchParams: {
    search?: string;
    stage?: string;
    type?: string;
    priority?: string;
    tag?: string;
  };
}) {
  const projects = await getProjects({
    search: searchParams.search,
    dev_stage: searchParams.stage as DevStage | "all" | undefined,
    project_type: searchParams.type as ProjectType | "all" | undefined,
    priority: searchParams.priority as PriorityLevel | "all" | undefined,
    tags: searchParams.tag && searchParams.tag !== "all" ? [searchParams.tag] : undefined,
  });

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Create your first project to get started tracking your development progress."
        action={<QuickAddModal />}
      />
    );
  }

  return <ProjectGrid projects={projects} />;
}

function ProjectListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[180px] w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage and track your development projects
          </p>
        </div>
        <QuickAddModal />
      </div>

      <Suspense fallback={null}>
        <ProjectFilters />
      </Suspense>

      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectList searchParams={params} />
      </Suspense>
    </div>
  );
}

import { getProjects } from "@/actions/projects";
import { ProjectGrid } from "@/components/projects/project-grid";
import { EmptyState } from "@/components/shared/empty-state";

export default async function ArchivePage() {
  const projects = await getProjects(undefined, undefined, true);
  const archivedProjects = projects.filter((p) => p.isArchived);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Archive</h2>
        <p className="text-muted-foreground">
          View and restore archived projects
        </p>
      </div>

      {archivedProjects.length === 0 ? (
        <EmptyState
          title="No archived projects"
          description="Archived projects will appear here. You can archive projects from the project detail page."
        />
      ) : (
        <ProjectGrid projects={archivedProjects} />
      )}
    </div>
  );
}

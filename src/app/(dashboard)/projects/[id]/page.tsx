import { notFound } from "next/navigation";
import { getProject, getTags } from "@/actions/projects";
import { getDecryptedGitHubSecret } from "@/actions/github";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectLinks } from "@/components/projects/project-links";
import { ProjectNotes } from "@/components/projects/project-notes";
import { ProjectTasks } from "@/components/projects/project-tasks";
import { ProjectTags } from "@/components/projects/project-tags";
import { GitHubSettings } from "@/components/projects/github-settings";
import { Separator } from "@/components/ui/separator";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  let project;
  try {
    project = await getProject(id);
  } catch {
    notFound();
  }

  if (!project) {
    notFound();
  }

  const [allTags, decryptedSecret] = await Promise.all([
    getTags(),
    getDecryptedGitHubSecret(project.id),
  ]);

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />
      <Separator />
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <ProjectTasks projectId={project.id} tasks={project.tasks ?? []} />
        </div>
        <div className="space-y-6">
          <ProjectForm project={project} />
          <ProjectTags
            projectId={project.id}
            projectTags={project.tags ?? []}
            allTags={allTags}
          />
          <ProjectLinks projectId={project.id} links={project.links ?? []} />
          <ProjectNotes projectId={project.id} notes={project.notes ?? []} />
          <GitHubSettings
            projectId={project.id}
            githubRepo={project.githubRepo}
            githubSecret={decryptedSecret}
          />
        </div>
      </div>
    </div>
  );
}

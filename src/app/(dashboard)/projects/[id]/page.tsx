import { notFound } from "next/navigation";
import { getProject } from "@/actions/projects";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectForm } from "@/components/projects/project-form";
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

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />
      <Separator />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}

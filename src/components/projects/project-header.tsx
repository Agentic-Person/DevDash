"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StageBadge, MarketingStageBadge } from "./stage-badge";
import { getPriorityConfig, getProjectTypeConfig, isMarketingEligible } from "@/lib/constants";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveProject, deleteProject } from "@/actions/projects";
import { toast } from "sonner";
import { ArrowLeft, Archive, Trash2, ArchiveRestore } from "lucide-react";
import type { Project, DevStage, PriorityLevel, ProjectType, MarketingStage } from "@/types";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const priorityConfig = getPriorityConfig(project.priority as PriorityLevel);
  const projectType = getProjectTypeConfig(project.projectType as ProjectType);

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      await archiveProject(project.id, !project.isArchived);
      toast.success(project.isArchived ? "Project restored" : "Project archived");
      setShowArchiveDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteProject(project.id);
      toast.success("Project deleted");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={project.devStage as DevStage} />
              {isMarketingEligible(project.devStage as DevStage) && project.marketingStage && (
                <MarketingStageBadge stage={project.marketingStage as MarketingStage} />
              )}
              <span className="text-sm text-muted-foreground">
                {projectType.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {priorityConfig.label} priority
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveDialog(true)}
            >
              {project.isArchived ? (
                <ArchiveRestore className="mr-2 h-4 w-4" />
              ) : (
                <Archive className="mr-2 h-4 w-4" />
              )}
              {project.isArchived ? "Restore" : "Archive"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {project.description && (
          <p className="text-muted-foreground max-w-2xl">{project.description}</p>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title={project.isArchived ? "Restore Project" : "Archive Project"}
        description={
          project.isArchived
            ? "This project will be moved back to your active projects."
            : "This project will be moved to the archive. You can restore it later."
        }
        confirmLabel={project.isArchived ? "Restore" : "Archive"}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}

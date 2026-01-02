"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageBadge, MarketingStageBadge } from "./stage-badge";
import { getPriorityBorderClass } from "./priority-indicator";
import { getProjectTypeConfig, isMarketingEligible } from "@/lib/constants";
import type { Project, DevStage, PriorityLevel, ProjectType, MarketingStage } from "@/types";
import { cn } from "@/lib/utils";
import { Calendar, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const priorityBorder = getPriorityBorderClass(project.priority as PriorityLevel);
  const projectType = getProjectTypeConfig(project.projectType as ProjectType);

  return (
    <Link href={`/projects/${project.id}`}>
      <Card
        className={cn(
          "h-full transition-colors hover:bg-accent/50 border-l-4",
          priorityBorder
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {project.name}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StageBadge stage={project.devStage as DevStage} size="sm" />
            {isMarketingEligible(project.devStage as DevStage) && project.marketingStage && (
              <MarketingStageBadge stage={project.marketingStage as MarketingStage} size="sm" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{projectType.label}</span>
            {project.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(project.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(project.lastActivityAt), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

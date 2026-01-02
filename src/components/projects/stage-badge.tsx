import { Badge } from "@/components/ui/badge";
import { getDevStageConfig, getMarketingStageConfig } from "@/lib/constants";
import type { DevStage, MarketingStage } from "@/types";
import { cn } from "@/lib/utils";

interface StageBadgeProps {
  stage: DevStage;
  size?: "sm" | "default";
}

export function StageBadge({ stage, size = "default" }: StageBadgeProps) {
  const config = getDevStageConfig(stage);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        config.color,
        "text-white border-0",
        size === "sm" && "text-xs px-1.5 py-0"
      )}
    >
      {config.label}
    </Badge>
  );
}

interface MarketingStageBadgeProps {
  stage: MarketingStage | null;
  size?: "sm" | "default";
}

export function MarketingStageBadge({ stage, size = "default" }: MarketingStageBadgeProps) {
  if (!stage) return null;

  const config = getMarketingStageConfig(stage);

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        size === "sm" && "text-xs px-1.5 py-0"
      )}
    >
      {config.label}
    </Badge>
  );
}

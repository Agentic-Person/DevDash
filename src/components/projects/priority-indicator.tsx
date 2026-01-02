import { getPriorityConfig } from "@/lib/constants";
import type { PriorityLevel } from "@/types";
import { cn } from "@/lib/utils";

interface PriorityIndicatorProps {
  priority: PriorityLevel;
  showLabel?: boolean;
  className?: string;
}

export function PriorityIndicator({
  priority,
  showLabel = false,
  className,
}: PriorityIndicatorProps) {
  const config = getPriorityConfig(priority);

  if (showLabel) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {config.label}
      </span>
    );
  }

  // Return just the border class to be applied to a parent container
  return null;
}

export function getPriorityBorderClass(priority: PriorityLevel): string {
  const config = getPriorityConfig(priority);
  return config.borderColor;
}

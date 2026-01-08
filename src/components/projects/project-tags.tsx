"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTag, addTagToProject, removeTagFromProject } from "@/actions/projects";
import { toast } from "sonner";
import { X, Tags } from "lucide-react";
import { PRESET_TAGS } from "@/lib/constants";
import type { Tag } from "@/types";

interface ProjectTagsProps {
  projectId: string;
  projectTags: Tag[];
  allTags: Tag[];
}

export function ProjectTags({ projectId, projectTags, allTags }: ProjectTagsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Get tag names that are already assigned
  const assignedTagNames = projectTags.map((t) => t.name);

  const handleAddTag = async (tagName: string) => {
    setIsAdding(true);
    try {
      // Check if tag exists in DB
      let tag = allTags.find((t) => t.name === tagName);

      // If not, create it
      if (!tag) {
        tag = await createTag(tagName);
      }

      await addTagToProject(projectId, tag.id);
      toast.success(`Added "${tagName}" tag`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add tag");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTag = async (tagId: string, tagName: string) => {
    setIsRemoving(tagId);
    try {
      await removeTagFromProject(projectId, tagId);
      toast.success(`Removed "${tagName}" tag`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove tag");
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Tags
        </CardTitle>
        <Select
          onValueChange={handleAddTag}
          disabled={isAdding}
          value=""
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={isAdding ? "Adding..." : "Add tag"} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PRESET_TAGS).map(([category, tags]) => (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
                {tags.map((tagName) => (
                  <SelectItem
                    key={tagName}
                    value={tagName}
                    disabled={assignedTagNames.includes(tagName)}
                  >
                    {tagName}
                    {assignedTagNames.includes(tagName) && " ✓"}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {projectTags.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tags yet. Use the dropdown to add tags.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {projectTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1"
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag.id, tag.name)}
                  disabled={isRemoving === tag.id}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  {isRemoving === tag.id ? (
                    <span className="h-3 w-3 block text-xs">...</span>
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

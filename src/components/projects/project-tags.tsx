"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createTag, addTagToProject, removeTagFromProject } from "@/actions/projects";
import { toast } from "sonner";
import { Plus, X, Tags, Check } from "lucide-react";
import type { Tag } from "@/types";

interface ProjectTagsProps {
  projectId: string;
  projectTags: Tag[];
  allTags: Tag[];
}

export function ProjectTags({ projectId, projectTags, allTags }: ProjectTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const availableTags = allTags.filter(
    (tag) => !projectTags.some((pt) => pt.id === tag.id)
  );

  const handleAddTag = async (tagId: string) => {
    setIsAdding(tagId);
    try {
      await addTagToProject(projectId, tagId);
      toast.success("Tag added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add tag");
    } finally {
      setIsAdding(null);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setIsRemoving(tagId);
    try {
      await removeTagFromProject(projectId, tagId);
      toast.success("Tag removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove tag");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreating(true);
    try {
      const tag = await createTag(newTagName);
      await addTagToProject(projectId, tag.id);
      setNewTagName("");
      toast.success("Tag created and added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Tags
        </CardTitle>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Create new tag</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={handleCreateTag}
                    disabled={isCreating || !newTagName.trim()}
                  >
                    {isCreating ? "..." : "Add"}
                  </Button>
                </div>
              </div>

              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Existing tags</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleAddTag(tag.id)}
                      >
                        {isAdding === tag.id ? (
                          "..."
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            {tag.name}
                          </>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        {projectTags.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tags yet. Add tags to organize and filter your projects.
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
                  onClick={() => handleRemoveTag(tag.id)}
                  disabled={isRemoving === tag.id}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  {isRemoving === tag.id ? (
                    <span className="h-3 w-3 block">...</span>
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

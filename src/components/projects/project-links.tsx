"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLink, deleteLink } from "@/actions/projects";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import type { ProjectLink } from "@/types";

const linkSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  url: z.string().url("Must be a valid URL"),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface ProjectLinksProps {
  projectId: string;
  links: ProjectLink[];
}

export function ProjectLinks({ projectId, links }: ProjectLinksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      label: "",
      url: "",
    },
  });

  const onSubmit = async (data: LinkFormData) => {
    setIsLoading(true);
    try {
      await createLink(projectId, data);
      toast.success("Link added");
      form.reset();
      setIsAdding(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    setDeletingId(linkId);
    try {
      await deleteLink(linkId, projectId);
      toast.success("Link deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete link");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Links
        </CardTitle>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., GitHub, Live Site" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}

        {links.length === 0 && !isAdding ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No links yet. Add GitHub, live site, or other related URLs.
          </p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:underline flex-1 min-w-0"
                >
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{link.label}</span>
                  <span className="text-muted-foreground truncate">{link.url}</span>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(link.id)}
                  disabled={deletingId === link.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

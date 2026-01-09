"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateGitHubSettings, generateWebhookSecret, syncTasksFromGitHub } from "@/actions/github";
import { toast } from "sonner";
import { Github, RefreshCw, Copy, Check, ExternalLink } from "lucide-react";

interface GitHubSettingsProps {
  projectId: string;
  githubRepo: string | null;
  githubSecret: string | null;
}

export function GitHubSettings({ projectId, githubRepo, githubSecret }: GitHubSettingsProps) {
  const [repo, setRepo] = useState(githubRepo || "");
  const [secret, setSecret] = useState(githubSecret || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState<"url" | "secret" | null>(null);

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/github/webhook`
    : "/api/github/webhook";

  const handleGenerateSecret = async () => {
    const newSecret = await generateWebhookSecret();
    setSecret(newSecret);
    toast.success("Secret generated - don't forget to save!");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGitHubSettings(projectId, {
        githubRepo: repo.trim() || null,
        githubSecret: secret.trim() || null,
      });
      toast.success("GitHub settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    if (!repo) {
      toast.error("Configure GitHub repo first");
      return;
    }
    setIsSyncing(true);
    try {
      const result = await syncTasksFromGitHub(projectId);
      toast.success(`Synced: ${result.created} new, ${result.updated} updated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = async (text: string, type: "url" | "secret") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          Sync tasks from TASKS.md in your GitHub repository
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="github-repo">Repository</Label>
          <Input
            id="github-repo"
            placeholder="owner/repo-name"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Format: owner/repo (e.g., Agentic-Person/my-project)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-secret">Webhook Secret</Label>
          <div className="flex gap-2">
            <Input
              id="webhook-secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Click generate to create a secret"
              className="font-mono text-xs"
            />
            <Button variant="outline" size="sm" onClick={handleGenerateSecret}>
              Generate
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          <Button variant="outline" onClick={handleSync} disabled={isSyncing || !repo}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>

        {repo && secret && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <p className="text-sm font-medium">Webhook Setup</p>
            <p className="text-xs text-muted-foreground">
              Add this webhook to your GitHub repo: Settings → Webhooks → Add webhook
            </p>

            <div className="space-y-2">
              <Label className="text-xs">Payload URL</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-xs bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl, "url")}
                >
                  {copied === "url" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Secret</Label>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-xs bg-muted"
                  type="password"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(secret, "secret")}
                >
                  {copied === "secret" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Content type: <code className="bg-muted px-1 rounded">application/json</code></p>
              <p>Events: Just the <code className="bg-muted px-1 rounded">push</code> event</p>
            </div>

            <a
              href={`https://github.com/${repo}/settings/hooks/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open GitHub Webhook Settings
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

# DevDash GitHub Integration Guide

## Overview

DevDash can automatically sync your task list with GitHub repositories. When you push code from Claude Code (or any git client), your tasks in DevDash update automatically.

```
┌─────────────────┐      ┌─────────────┐      ┌─────────────────┐
│   Claude Code   │      │   GitHub    │      │    DevDash      │
│   (local dev)   │ ───► │   (remote)  │ ───► │   (browser)     │
│                 │ push │             │ hook │                 │
│   TASKS.md      │      │  webhook    │      │   Task List     │
└─────────────────┘      └─────────────┘      └─────────────────┘
```

---

## How It Works

1. **Each DevDash project links to one GitHub repo**
2. **TASKS.md file** in your repo root contains your task list
3. **GitHub webhook** fires on every push
4. **DevDash receives the webhook** and syncs tasks from TASKS.md

---

## Setup Instructions

### Step 1: Link Project to GitHub (in DevDash)

1. Open your project in DevDash
2. Go to **GitHub Settings** section
3. Enter your repo in format: `owner/repo-name`
   - Example: `Agentic-Person/my-project`
4. Click **Generate Secret** - this creates a webhook secret
5. Copy the **Webhook URL** shown (e.g., `https://devdash.yourdomain.com/api/github/webhook`)

### Step 2: Add Webhook in GitHub

1. Go to your GitHub repo
2. Navigate to **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: Paste the webhook URL from DevDash
   - **Content type**: `application/json`
   - **Secret**: Paste the secret from DevDash
   - **Events**: Select "Just the push event"
4. Click **Add webhook**

### Step 3: Create TASKS.md in Your Repo

Create a `TASKS.md` file in your repository root:

```markdown
# Tasks

## General
- [ ] Initial project setup
- [ ] Configure environment variables

## UI/Frontend
- [ ] Build homepage layout
- [ ] Add navigation component
- [ ] Implement responsive design

## Backend/API
- [ ] Create user authentication
- [ ] Set up database models
- [ ] Build REST endpoints

## Testing
- [ ] Write unit tests
- [ ] Set up CI/CD pipeline
```

### Step 4: Push and Sync

```bash
git add TASKS.md
git commit -m "Add task list"
git push
```

DevDash will automatically update with your tasks!

---

## TASKS.md Format

### Basic Structure

```markdown
## Category Name
- [ ] Incomplete task
- [x] Completed task
- [ ] Another task with details
```

### Rules

| Element | Format | Example |
|---------|--------|---------|
| Category | `## Heading` | `## UI/Frontend` |
| Incomplete task | `- [ ] Task` | `- [ ] Build login page` |
| Completed task | `- [x] Task` | `- [x] Setup database` |

### Supported Categories

These map to DevDash's predefined categories:
- General
- UI/Frontend
- Backend/API
- Database
- Testing
- Documentation
- DevOps/Deployment
- Bug Fix
- Feature
- Research

Custom headings will be mapped to "General".

---

## Sync Behavior

| TASKS.md Change | DevDash Result |
|-----------------|----------------|
| New `- [ ] Task` added | Creates new task |
| `- [ ]` changed to `- [x]` | Marks task completed |
| `- [x]` changed to `- [ ]` | Marks task incomplete |
| Task removed from file | Task remains in DevDash (not deleted) |
| Category heading changed | Task moves to new category |

---

## Working with Claude Code

### Recommended Workflow

1. **Start a session**: Open your project in Claude Code
2. **Claude manages TASKS.md**: Ask Claude to update your task list as you work
3. **Push regularly**: Each push syncs your progress to DevDash
4. **View in DevDash**: Check your dashboard for an overview of all projects

### Example Claude Code Prompts

```
"Add these tasks to TASKS.md under UI/Frontend:
- Build user profile page
- Add avatar upload
- Implement settings panel"

"Mark the login page task as complete in TASKS.md"

"Show me the current TASKS.md and update it with our progress"
```

---

## Troubleshooting

### Tasks not syncing?

1. **Check webhook delivery**: GitHub repo → Settings → Webhooks → Recent Deliveries
2. **Verify secret matches**: DevDash secret must match GitHub webhook secret
3. **Check TASKS.md format**: Ensure proper `- [ ]` checkbox format
4. **Confirm DevDash is accessible**: Webhook URL must be publicly reachable

### Common Issues

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Webhook secret mismatch - regenerate and update |
| 404 Not Found | Check webhook URL is correct |
| Tasks not appearing | Verify TASKS.md is in repo root, not a subfolder |
| Wrong category | Use exact category names from supported list |

### Testing the Webhook

1. In GitHub webhook settings, click **Redeliver** on a recent delivery
2. Or make a small change to TASKS.md and push

---

## Private Repositories

For private repos, DevDash needs a GitHub Personal Access Token to read TASKS.md:

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate token with `repo` scope
3. Add token to DevDash project settings

---

## Multiple Projects

Each project in DevDash can link to a different GitHub repo:

| DevDash Project | GitHub Repo |
|-----------------|-------------|
| Client Website | `client/website` |
| Internal Tool | `Agentic-Person/internal-tool` |
| Side Project | `Agentic-Person/side-project` |

Each has its own:
- TASKS.md file
- Webhook configuration
- Independent task sync

---

## Architecture Reference

```
DevDash Database
├── Project
│   ├── id
│   ├── name
│   ├── githubRepo: "owner/repo"      ← Links to GitHub
│   ├── githubSecret: "webhook_secret" ← Verifies webhooks
│   └── tasks[]
│       ├── title
│       ├── category
│       ├── completed
│       └── ...

GitHub Webhook Flow
1. Push to repo
2. GitHub POST → /api/github/webhook
3. Verify signature with githubSecret
4. Find project by githubRepo
5. Fetch TASKS.md via GitHub API
6. Parse markdown → sync tasks
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `TASKS.md` | Task list in your repo (source of truth) |
| `/api/github/webhook` | Endpoint that receives GitHub webhooks |
| `src/actions/github.ts` | Server actions for GitHub sync |
| `src/lib/task-parser.ts` | Parses TASKS.md markdown format |

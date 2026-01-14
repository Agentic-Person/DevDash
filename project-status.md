# DevDash Project Status

**Last Updated**: 2026-01-13
**Project Directory**: `C:\projects\DevDash`
**Build Status**: Passing
**Production URL**: https://dev-dash-007.vercel.app/
**Repository**: https://github.com/Agentic-Person/DevDash

---

## Project Overview

DevDash is a single-user developer project dashboard for tracking projects across their lifecycle. It provides a centralized place to manage development projects from initial idea through launch and maintenance, with optional marketing pipeline tracking.

**Tech Stack**:
- **Framework**: Next.js 16.1.1 (App Router, webpack for dev)
- **Database**: Prisma + PostgreSQL (Neon)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Drag & Drop**: @hello-pangea/dnd
- **Language**: TypeScript
- **Forms**: react-hook-form + zod validation
- **Icons**: lucide-react
- **Date Handling**: date-fns
- **Notifications**: sonner

---

## Recent Updates (2026-01-13)

### Security Audit & Encryption
- Conducted full security audit of codebase
- Added AES-256-GCM encryption for GitHub webhook secrets
- Created `src/lib/crypto.ts` with encrypt/decrypt utilities
- Secrets now stored encrypted in database, decrypted at runtime

### Kanban Board Implementation
- Added 5-column Kanban board: Todo → In Development → Testing → Complete → Shipped
- Full drag-and-drop support between columns using @hello-pangea/dnd
- Board/List view toggle (Board is default, persists to localStorage)
- New components: `kanban-board.tsx`, `kanban-column.tsx`, `kanban-card.tsx`
- New database field: `status` on ProjectTask model
- New server actions: `moveTask`, `updateTaskStatus`, `reorderTasksInColumn`

### Production Deployment
- Migrated from SQLite to PostgreSQL (Neon) for serverless compatibility
- Deployed to Vercel at https://dev-dash-007.vercel.app/
- Updated Prisma schema with `directUrl` for Neon connection pooling
- Added `postinstall` and build scripts for Prisma generation

### Development Roadmap
- Created TASKS.md with 43 development tasks across 8 categories
- Ready for import via GitHub webhook sync or manual import

### Known Issues
- GitHub webhook sync returning server error (needs debugging)
- Error occurs when clicking "Sync Now" - likely related to TASKS.md parsing or API response

---

## Features Implemented

### Dashboard
- **Project Grid**: Responsive card layout (1-4 columns based on screen size)
- **Real-time Filtering**:
  - Text search (searches name and description)
  - Dev stage filter dropdown
  - Project type filter dropdown
  - Priority filter dropdown
  - Tag filter dropdown (filter by preset tags)
- **URL-based Filters**: Filters persist in URL for shareability
- **Empty State**: Friendly message when no projects exist
- **Quick Add**: Modal for rapidly creating new projects

### Project Cards
- **Priority Indicator**: Color-coded left border (gray/blue/orange/red)
- **Stage Badge**: Color-coded badge showing current dev stage
- **Marketing Badge**: Shows marketing stage if project is eligible
- **Project Type**: Displayed in footer
- **Tags Display**: Shows assigned tags (max 3 with "+N" overflow)
- **Deadline**: Shows calendar icon with date if set
- **Last Activity**: Relative time display ("2 hours ago")
- **Click Navigation**: Entire card is clickable to view details

### Project Detail Page
- **Two-Column Layout**:
  - **Left Column**: Tasks (with categories, bulk import)
  - **Right Column**: Project form, tags, links, notes, GitHub settings
- **Back Navigation**: Return to previous page
- **Project Header**: Name, badges, type, and priority display
- **Action Buttons**: Archive/Restore and Delete with confirmation dialogs

### Task Management
- **Task Categories**: 10 predefined categories for organization:
  - General, UI/Frontend, Backend/API, Database, Testing
  - Documentation, DevOps/Deployment, Bug Fix, Feature, Research
- **Collapsible Category Sections**: Tasks grouped by category with expand/collapse
- **Add Tasks**: Title, category dropdown, priority, and due date
- **Edit Tasks**: Inline editing with all fields
- **Complete Tasks**: Toggle checkbox to mark done
- **Delete Tasks**: Remove individual tasks
- **Bulk Import**: Import multiple tasks from markdown checklists
  - Supports `- [ ] Task` and `- [x] Completed task` format
  - Auto-detects categories from `## Heading` sections
- **Drag Reorder**: Reorder tasks within the list (sortOrder)

### GitHub Integration
- **Repository Linking**: Connect any GitHub repo to a project
- **Webhook Support**: Automatic task sync on push events
  - Webhook URL generation
  - Secret key generation with copy button
  - Signature verification (SHA-256 HMAC)
- **TASKS.md Sync**: Reads task list from repo root
  - Parses markdown checkboxes
  - Creates new tasks automatically
  - Updates completion status
  - Syncs category changes
- **Manual Sync**: Button to sync tasks on-demand
- **Setup Guide**: In-app instructions with direct GitHub settings link

### Preset Tags System
- **15 Predefined Tags** across 3 categories:
  - **Work Type**: Client Work, Side Project, Open Source, Freelance
  - **Tech Stack**: Frontend, Backend, Full Stack, Mobile, API, Graphics/Design
  - **Status**: MVP, Development, Testing, Production, Maintenance
- **Assign Tags**: Dropdown to add/remove tags per project
- **Tag Filter**: Filter projects by tag on the dashboard
- **Tag Display**: Tags shown on project cards

### Project Links Management
- **Add Links**: Add URLs with custom labels (GitHub, Live Site, Figma, etc.)
- **View Links**: Display links with external link icons
- **Delete Links**: Remove links with single click
- **Inline Form**: Add links directly on the project detail page

### Project Notes
- **Add Notes**: Create text notes for each project
- **Edit Notes**: Inline editing with save/cancel
- **Delete Notes**: Remove notes with confirmation
- **Timestamps**: Shows relative time ("2 hours ago") for each note

### Editable Project Form
- Name (required, max 255 chars)
- Description (optional, textarea)
- Dev Stage (7 options)
- Marketing Stage (4 options, only shown for eligible stages)
- Project Type (6 options)
- Priority (4 levels)
- Deadline (date picker with calendar)

### Archive Page
- Lists all archived projects
- Same card display as main dashboard
- Click to view/restore projects

### Settings Page
- **Data Export**: Download all projects, links, and notes as JSON
- **About Section**: App description

### Theme System
- **Dark Mode Default**: Optimized for developer preference
- **Theme Toggle**: Light/Dark/System options in header dropdown
- **Persistence**: Theme preference saved to localStorage

### Layout Components
- **Header**:
  - App title/logo
  - Theme toggle button
  - User avatar with dropdown menu
- **Sidebar** (desktop only):
  - Dashboard link
  - Archive link
  - Settings link
  - Active state highlighting

---

## File Structure (Detailed)

```
C:\projects\DevDash\
├── .env.local                    # Database path (SQLite)
├── .env.local.example            # Template for env variables
├── CLAUDE.md                     # Claude Code instructions
├── project-status.md             # This file
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── dev.db                    # SQLite database file
│
├── docs/
│   └── GITHUB-INTEGRATION.md     # GitHub webhook setup guide
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with ThemeProvider & Toaster
│   │   ├── globals.css           # Global styles + Tailwind
│   │   │
│   │   ├── (dashboard)/          # Dashboard route group
│   │   │   ├── layout.tsx        # Dashboard layout with header/sidebar
│   │   │   ├── page.tsx          # Main dashboard with project grid
│   │   │   ├── archive/
│   │   │   │   └── page.tsx      # Archived projects page
│   │   │   ├── settings/
│   │   │   │   └── page.tsx      # Settings & export page
│   │   │   └── projects/
│   │   │       └── [id]/
│   │   │           └── page.tsx  # Project detail/edit page
│   │   │
│   │   └── api/
│   │       └── github/
│   │           └── webhook/
│   │               └── route.ts  # GitHub webhook handler
│   │
│   ├── actions/
│   │   ├── projects.ts           # Project/task/link/note/tag CRUD
│   │   └── github.ts             # GitHub sync actions
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (21 components)
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── collapsible.tsx   # For task category sections
│   │   │   ├── command.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── header.tsx        # App header with user menu
│   │   │   ├── sidebar.tsx       # Navigation sidebar
│   │   │   └── theme-toggle.tsx  # Light/dark/system toggle
│   │   │
│   │   ├── projects/
│   │   │   ├── priority-indicator.tsx  # Priority border styling
│   │   │   ├── project-card.tsx        # Individual project card
│   │   │   ├── project-filters.tsx     # Search & filter controls
│   │   │   ├── project-form.tsx        # Edit form for project details
│   │   │   ├── project-grid.tsx        # Grid container for cards
│   │   │   ├── project-header.tsx      # Detail page header with actions
│   │   │   ├── quick-add-modal.tsx     # New project creation modal
│   │   │   ├── stage-badge.tsx         # Dev & marketing stage badges
│   │   │   ├── project-links.tsx       # Links management component
│   │   │   ├── project-notes.tsx       # Notes management component
│   │   │   ├── project-tags.tsx        # Tags management component
│   │   │   ├── project-tasks.tsx       # Tasks with categories & bulk import
│   │   │   └── github-settings.tsx     # GitHub integration settings
│   │   │
│   │   └── shared/
│   │       ├── confirm-dialog.tsx      # Reusable confirmation dialog
│   │       └── empty-state.tsx         # Empty state placeholder
│   │
│   ├── lib/
│   │   ├── constants.ts          # Enums, colors, task categories, preset tags
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── task-parser.ts        # Markdown task parser for TASKS.md
│   │   └── utils.ts              # cn() utility from shadcn
│   │
│   ├── providers/
│   │   └── theme-provider.tsx    # next-themes provider wrapper
│   │
│   └── types/
│       └── index.ts              # Type definitions
│
└── public/                       # Static assets
```

---

## Server Actions API

### Projects

#### `getProjects(filters?, sort?, includeArchived?)`
Fetches all projects with optional filtering and sorting.

```typescript
filters?: {
  search?: string;
  dev_stage?: DevStage | "all";
  project_type?: ProjectType | "all";
  priority?: PriorityLevel | "all";
  tags?: string[];  // Tag names to filter by
}
sort?: {
  field: "name" | "created_at" | "updated_at" | "last_activity_at" | "deadline" | "priority";
  direction: "asc" | "desc";
}
includeArchived?: boolean;  // Default: false
```

#### `getProject(id)`
Fetches a single project with all relations (links, notes, tasks, tags).

#### `createProject(formData)`
Creates a new project.

#### `updateProject(id, formData)`
Updates an existing project.

#### `deleteProject(id)`
Permanently deletes a project (cascades to all related data).

#### `archiveProject(id, archive?)`
Archives or restores a project.

### Links

#### `createLink(projectId, data)`
Creates a new link for a project.

#### `deleteLink(id, projectId)`
Deletes a link from a project.

### Notes

#### `createNote(projectId, content)`
Creates a new note for a project.

#### `updateNote(id, projectId, content)`
Updates an existing note.

#### `deleteNote(id, projectId)`
Deletes a note from a project.

### Tags

#### `getTags()`
Fetches all tags, ordered alphabetically.

#### `createTag(name)`
Creates a new tag.

#### `deleteTag(id)`
Deletes a tag.

#### `addTagToProject(projectId, tagId)`
Assigns a tag to a project.

#### `removeTagFromProject(projectId, tagId)`
Removes a tag from a project.

### Tasks

#### `createTask(projectId, data)`
Creates a new task with title, category, priority, and optional due date.

#### `updateTask(id, projectId, data)`
Updates an existing task.

#### `toggleTaskComplete(id, projectId)`
Toggles the completed status of a task.

#### `deleteTask(id, projectId)`
Deletes a task.

#### `reorderTasks(projectId, taskIds)`
Reorders tasks by updating sortOrder based on array position.

#### `bulkCreateTasks(projectId, tasks)`
Creates multiple tasks at once (used for bulk import).

### GitHub

#### `generateWebhookSecret()`
Generates a cryptographically secure webhook secret.

#### `updateGitHubSettings(projectId, data)`
Updates GitHub repo and secret for a project.

#### `syncTasksFromGitHub(projectId)`
Manually fetches and syncs tasks from TASKS.md.

#### `findProjectByGitHubRepo(repo)`
Finds a project by its linked GitHub repository.

---

## Type Definitions

### Enums

```typescript
type DevStage =
  | "idea"           // Gray - Initial concept
  | "planning"       // Blue - Designing/architecting
  | "in_development" // Yellow - Actively coding
  | "testing"        // Orange - QA/bug fixing
  | "demo_ready"     // Purple - Ready to show
  | "launched"       // Green - Live/published
  | "maintained";    // Teal - Ongoing maintenance

type MarketingStage =
  | "script"       // Writing content script
  | "video"        // Recording/editing video
  | "social_media" // Creating social posts
  | "done";        // Marketing complete

type ProjectType =
  | "web_app"    // Web Application
  | "mobile_app" // Mobile App
  | "cli_tool"   // Command Line Tool
  | "library"    // Package/Library
  | "api"        // API/Backend
  | "other";     // Other

type PriorityLevel =
  | "low"      // Gray border
  | "medium"   // Blue border
  | "high"     // Orange border
  | "critical"; // Red border
```

### Task Categories

```typescript
const TASK_CATEGORIES = [
  "General",
  "UI/Frontend",
  "Backend/API",
  "Database",
  "Testing",
  "Documentation",
  "DevOps/Deployment",
  "Bug Fix",
  "Feature",
  "Research",
] as const;
```

### Preset Tags

```typescript
const PRESET_TAGS = {
  workType: [
    "Client Work",
    "Side Project",
    "Open Source",
    "Freelance",
  ],
  techStack: [
    "Frontend",
    "Backend",
    "Full Stack",
    "Mobile",
    "API",
    "Graphics/Design",
  ],
  status: [
    "MVP",
    "Development",
    "Testing",
    "Production",
    "Maintenance",
  ],
};
```

---

## Database Schema (Prisma)

```prisma
model Project {
  id             String   @id @default(cuid())
  name           String
  description    String?
  devStage       String   @default("idea")
  marketingStage String?
  projectType    String   @default("web_app")
  priority       String   @default("medium")
  deadline       DateTime?
  isArchived     Boolean  @default(false)
  githubRepo     String?
  githubSecret   String?
  lastActivityAt DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  links ProjectLink[]
  notes ProjectNote[]
  tasks ProjectTask[]
  tags  ProjectTag[]
}

model ProjectLink {
  id        String   @id @default(cuid())
  projectId String
  label     String
  url       String
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model ProjectNote {
  id        String   @id @default(cuid())
  projectId String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model ProjectTask {
  id        String    @id @default(cuid())
  projectId String
  title     String
  completed Boolean   @default(false)
  priority  String    @default("medium")
  category  String    @default("General")
  dueDate   DateTime?
  sortOrder Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model Tag {
  id        String       @id @default(cuid())
  name      String       @unique
  createdAt DateTime     @default(now())
  projects  ProjectTag[]
}

model ProjectTag {
  projectId String
  tagId     String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([projectId, tagId])
}
```

---

## GitHub Integration

### How It Works

```
┌─────────────────┐      ┌─────────────┐      ┌─────────────────┐
│   Claude Code   │      │   GitHub    │      │    DevDash      │
│   (local dev)   │ ───► │   (remote)  │ ───► │   (browser)     │
│                 │ push │             │ hook │                 │
│   TASKS.md      │      │  webhook    │      │   Task List     │
└─────────────────┘      └─────────────┘      └─────────────────┘
```

1. Link a GitHub repo to a DevDash project
2. Create TASKS.md in your repo root with markdown checkboxes
3. Configure webhook in GitHub with DevDash's URL and secret
4. Push code - tasks automatically sync

### TASKS.md Format

```markdown
## UI/Frontend
- [ ] Build homepage layout
- [x] Add navigation component

## Backend/API
- [ ] Create user authentication
- [ ] Set up database models
```

### Webhook Endpoint

`POST /api/github/webhook`

- Receives GitHub push events
- Verifies signature with SHA-256 HMAC
- Fetches TASKS.md via GitHub API
- Syncs tasks to DevDash

See `docs/GITHUB-INTEGRATION.md` for full setup instructions.

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repo-url>
cd DevDash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
DATABASE_URL="file:./dev.db"
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Preset Tags (Optional)

The preset tags will be created automatically when you first assign one.

### 5. Run Development Server

```bash
npm run dev -- -p 3002
```

**Note**: Never use port 3000 - it's reserved for Docker.

Open [http://localhost:3002](http://localhost:3002)

---

## Development Commands

```bash
# Start development server (use port 3002)
npm run dev -- -p 3002

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Prisma commands
npx prisma studio      # Open database GUI
npx prisma db push     # Push schema changes
npx prisma generate    # Regenerate client
```

---

## Visual Design

### Color Scheme

| Dev Stage | Background Color | Hex |
|-----------|-----------------|-----|
| idea | Gray | `#6b7280` |
| planning | Blue | `#3b82f6` |
| in_development | Yellow | `#eab308` |
| testing | Orange | `#f97316` |
| demo_ready | Purple | `#a855f7` |
| launched | Green | `#22c55e` |
| maintained | Teal | `#14b8a6` |

| Priority | Border Color | Hex |
|----------|-------------|-----|
| low | Gray | `#9ca3af` |
| medium | Blue | `#60a5fa` |
| high | Orange | `#fb923c` |
| critical | Red | `#ef4444` |

### Responsive Breakpoints
- **Mobile** (<640px): 1 column grid
- **Small** (640px+): 2 column grid
- **Large** (1024px+): 3 column grid
- **XL** (1280px+): 4 column grid

---

## Troubleshooting

### Prisma permission errors
- Stop the dev server before running `npx prisma db push`
- The dev server locks the SQLite database file

### Port conflicts
- Always use port 3002: `npm run dev -- -p 3002`
- Port 3000 is reserved for Docker

### Tasks not syncing from GitHub
1. Check webhook delivery in GitHub repo settings
2. Verify webhook secret matches in DevDash
3. Ensure TASKS.md is in repo root (not a subfolder)
4. Check task format: `- [ ] Task` or `- [x] Done`

### Build errors
- Run `npm run build` to see specific errors
- Clear `.next` folder: `rm -rf .next`
- Regenerate Prisma: `npx prisma generate`

---

## Project Metrics

- **Total Files**: ~55 source files
- **Components**: 21 shadcn/ui + 15 custom
- **Pages**: 4 (dashboard, project detail, archive, settings)
- **Server Actions**: 20+ (projects, tasks, links, notes, tags, GitHub)
- **Build Time**: ~5 seconds (webpack)
- **Database**: SQLite (single file, no server required)

---

## Recent Changes (2026-01-10)

### Task Categories & Bulk Import
- Added 10 predefined task categories
- Tasks now display in collapsible category sections
- Bulk import supports markdown checklist format
- Category auto-detection from `## Heading` sections

### Layout Reorganization
- Swapped layout: Tasks on left, Details on right
- Better workflow for task-focused development

### GitHub Integration
- Webhook endpoint for automatic sync
- TASKS.md parsing and sync
- Secret generation and verification
- Manual sync button
- Setup instructions in UI

### Preset Tags
- Changed from user-created to 15 preset tags
- Dropdown selector instead of create-your-own
- Organized into Work Type, Tech Stack, and Status categories

### Dev Server Fix
- Switched from Turbopack to webpack for dev server
- Turbopack has Windows/PostCSS compatibility issues (error 0xc0000142)
- Added `--webpack` flag to dev script in package.json

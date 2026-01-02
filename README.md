# DevDash

A single-user developer project dashboard for tracking projects across their lifecycle, from idea to maintenance.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![SQLite](https://img.shields.io/badge/SQLite-Prisma-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## Features

- **Project Tracking** - Track projects through 7 development stages (idea → maintained)
- **Quick Filtering** - Search and filter by stage, type, or priority
- **Project Details** - Add descriptions, deadlines, and track progress
- **Marketing Pipeline** - Optional marketing stage tracking for launched projects
- **Data Export** - Export all data as JSON
- **Dark Mode** - Dark theme by default with light/system options
- **Local Storage** - All data stored locally in SQLite (no server needed)

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: SQLite via Prisma
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Agentic-Person/DevDash.git
cd DevDash

# Install dependencies
npm install

# Generate Prisma client and create database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard routes
│   │   ├── page.tsx        # Main project grid
│   │   ├── archive/        # Archived projects
│   │   ├── settings/       # Settings & export
│   │   └── projects/[id]/  # Project detail
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, sidebar, theme toggle
│   ├── projects/           # Project cards, forms, filters
│   └── shared/             # Reusable components
├── actions/                # Server actions (CRUD)
├── lib/                    # Utilities & Prisma client
└── types/                  # TypeScript definitions
```

## Development Stages

| Stage | Description |
|-------|-------------|
| Idea | Initial concept |
| Planning | Designing/architecting |
| In Development | Actively coding |
| Testing | QA/bug fixing |
| Demo Ready | Ready to show |
| Launched | Live/published |
| Maintained | Ongoing maintenance |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Database

Data is stored in a local SQLite file at `prisma/dev.db`. To reset the database:

```bash
rm prisma/dev.db
npx prisma db push
```

## License

MIT

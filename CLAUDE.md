# Claude Code Guidelines for DevDash

## Development Server

**Never use port 3000** - it's reserved for Docker.

Always start the dev server on an alternate port:
```bash
npm run dev -- -p 3002
```

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- Prisma + SQLite
- Tailwind CSS v4
- shadcn/ui components

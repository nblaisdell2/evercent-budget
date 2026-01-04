# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build (runs patch-server.js after)
npm run preview      # Build and start production server locally
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run secrets      # Update secrets via PowerShell script
```

## Architecture Overview

This is a **Next.js 15 + React 19** budget management application using the T3 Stack pattern (tRPC + TanStack Query + Tailwind CSS).

### Key Technologies
- **tRPC 11**: Type-safe API layer with SuperJSON serialization
- **PostgreSQL**: Direct pg driver with custom connection pool (no ORM)
- **Zod**: Input validation for all tRPC procedures
- **TanStack React Query 5**: Server state management with 30s default stale time

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/trpc/[trpc]/   # tRPC HTTP handler
│   └── (budget)/_components/  # Budget feature components
├── server/api/            # tRPC backend (server-only)
│   ├── trpc.ts            # Context, procedures, middleware
│   ├── root.ts            # Router composition (add routers here)
│   └── routers/           # Individual feature routers
├── trpc/                  # Client-side tRPC setup
│   ├── react.tsx          # TRPCReactProvider wrapper
│   └── server.ts          # Server-side RSC caller
├── utils/db.ts            # PostgreSQL connection pool & query helpers
├── lib/icons.tsx          # Centralized icon exports
└── env.js                 # Environment variable validation schema
```

### tRPC Data Flow

1. Add routers in `src/server/api/routers/` using `publicProcedure`
2. Register routers in `src/server/api/root.ts`
3. Call from components via `api.routerName.procedureName()` (client) or direct import (RSC)

### Database Patterns

The `src/utils/db.ts` module provides three query methods:
- `querySQL<T>(sql, params)` - Raw SQL execution
- `query<T>(functionName, ...params)` - Call PostgreSQL functions
- `exec<T>(procName, ...params)` - Call PostgreSQL procedures

All use parameterized queries for SQL injection prevention.

**Production**: Connects via SSL using AWS RDS certificate (downloaded from S3).
**Development**: Direct TCP connection to local PostgreSQL.

### Environment Variables

Defined in `src/env.js` using `@t3-oss/env-nextjs`:
- Server-only: `DB_HOST`, `DB_DATABASE`, `DB_PORT`, `DB_USER`, `DB_PASS`, AWS vars
- Set `SKIP_ENV_VALIDATION=1` for Docker builds (secrets injected at runtime via `patch-server.js`)

### Path Alias

Use `~/` for imports from `src/` directory (e.g., `import { env } from "~/env"`).

### Component Conventions

- Server Components by default; add `"use client"` only for interactivity
- Budget components go in `src/app/(budget)/_components/`
- Icons imported from `~/lib/icons` (wraps @heroicons/react)

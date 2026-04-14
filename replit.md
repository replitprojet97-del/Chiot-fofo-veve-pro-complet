# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### Élevage du Berger Bleu (`artifacts/aussie-farm`)
- **Type**: React + Vite web app
- **Preview path**: `/` (root)
- **Port**: 21570
- **Description**: Full website for an Australian Shepherd breeding farm
- **Features**:
  - Hero section with full-viewport background image
  - Puppy gallery with color/sex filters (6 puppies, 4 coat colors)
  - Puppy detail modal with health/parent info
  - À Propos section with farm story and values
  - Contact form with success state, phone/email/WhatsApp links
  - Dark mode toggle
  - Responsive mobile/tablet/desktop layout
  - SEO meta tags + Open Graph
  - Playfair Display serif + Inter sans fonts
  - Warm earthy color theme (forest green primary, creamy beige/white)
- **Images**: `public/images/` — generated AI images (hero, puppies x4, farm, modal)

### API Server (`artifacts/api-server`)
- **Type**: Express API
- **Preview path**: `/api`
- **Port**: 8080

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

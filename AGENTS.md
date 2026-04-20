<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Stack

- **Frontend**: TanStack Start (React 19) + TanStack Router + Vinxi bundler
- **Backend**: Convex (`convex/`)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Forms**: react-hook-form + Zod + @hookform/resolvers
- **Deploy**: Vercel

## Commands

```
npm run dev        # Start dev server (vinxi dev)
npm run build      # Production build (vinxi build)
npm run start      # Start production server (vinxi start)
npm run typecheck  # TypeScript check (tsc --noEmit)
```

No test or lint scripts are configured. Prettier is installed but has no npm script.

## Architecture

- **`src/`** – Frontend app. Entry: `src/entry.client.tsx`. Router defined in `src/router.tsx`.
- **`src/routes/`** – File-based routes via TanStack Router. `routeTree.gen.ts` is auto-generated.
- **`convex/`** – Convex backend. Functions organized as `queries/`, `mutations/`, `actions/`. Schema in `convex/schema/`.
- **`convex/_generated/`** – Auto-generated Convex types/APIs. Do not edit manually.
- **`@/*`** path alias resolves to `./src/*`.

## Convex

- `VITE_CONVEX_URL` must be set in `.env.local` (see `.env.example`).
- Run `npx convex dev` alongside `npm run dev` in development to sync Convex functions and generate types.
- Always read `convex/_generated/ai/guidelines.md` before writing Convex code.

## Conventions

- Strict TypeScript: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` are enforced.
- Tailwind v4 uses `@tailwindcss/vite` plugin (not PostCSS).
- Route files are `.tsx` under `src/routes/`. New routes auto-register via the TanStack Router Vite plugin.

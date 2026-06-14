# Next.js v16

Read `node_modules/next/dist/docs/` before writing code — breaking changes from prior versions. If fixing slow client-side navigations, export `unstable_instant` from the route (bundled docs hint).

# Project

3D mechanical keyboard configurator — Next.js 16.2.9, React 19.2.4, Three.js 0.184 with `@react-three/fiber` 9.6.1 + `@react-three/drei` 10.7.7. Single-page app: `app/page.tsx` → `app/Scene.tsx` (`"use client"` boundary) → `@/Keyboard` (glTF model). `app/Scene.tsx` is the only client component; all other `app/` files are React Server Components by default.

# Commands & verification

- `npm run dev` — dev server (localhost:3000)
- `npm run build` — production build  
- `npm run start` — start production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)
- `npx tsc --noEmit` — TypeScript type-check (no npm script; run manually)
- **Always `npm run lint` then `npx tsc --noEmit` before committing.** No test framework is configured.

# Toolchain quirks

- **Tailwind CSS v4** — uses `@import "tailwindcss"` (not `@tailwind` directives). Custom tokens go in `@theme inline { ... }`.
- **ESLint** — flat config (`eslint.config.mjs`) using `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`.
- **PostCSS** — `postcss.config.mjs` with `@tailwindcss/postcss` plugin.
- **Path alias** — `@/*` maps to project root. E.g. `@/Keyboard`, `@/app/Scene`.
- **TypeScript** — `strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `noEmit: true`.
- **Three.js / R3F** — the R3F skill (`react-three-fiber`) is available to assist with Three.js patterns.

# 3D model

- `Keyboard.jsx` at repo root is **auto-generated** by `gltfjsx` — **do not edit manually**. Regenerate with:
  ```
  npx gltfjsx@6.5.3 public/models/keyboard.glb
  ```
- The file is `.jsx` (not `.tsx`), so it lacks full type safety. The `Model` component is a **named export** (`export function Model`), not a default export.
- The glTF includes an empty-string node name (`nodes['']`) — fragile, may need manual handling after regeneration.
- **Regeneration hazard** — after regenerating, verify that `useGLTF` and `useGLTF.preload` use the same path (both should be `/models/keyboard.glb`). The generator may produce mismatched paths.
- Model file: `public/models/keyboard.glb`.
- `Scene.tsx` also loads `public/models/floor.glb` (ground plane with radial fade texture).

`CLAUDE.md` references this file via `@AGENTS.md` — keep them in sync.

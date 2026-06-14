<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project

3D mechanical keyboard configurator — Next.js 16.2.9, React 19, Three.js (`@react-three/fiber` + `@react-three/drei`). Single-page app: `app/page.tsx` → `app/Scene.tsx` (client boundary) → `@/Keyboard` (glTF model). `app/Scene.tsx` is the only `"use client"` component; all other app files are React Server Components by default.

# Commands & verification

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — start production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)
- `npx tsc --noEmit` — TypeScript type-check (no npm script, run manually)
- **Always run `npm run lint` then `npx tsc --noEmit` before committing.** No test framework is configured.

# Toolchain quirks

- **Tailwind CSS v4** — uses `@import "tailwindcss"`, not `@tailwind` directives. Custom theme tokens go in `@theme inline { ... }`.
- **ESLint** — flat config (`eslint.config.mjs`) using `eslint-config-next` (core-web-vitals + typescript).
- **PostCSS** — `postcss.config.mjs` with `@tailwindcss/postcss` plugin.
- **Path alias** — `@/*` maps to project root. E.g., `@/Keyboard`, `@/app/Scene`.
- **TypeScript** — `strict: true`, `jsx: "react-jsx"`, module resolution `"bundler"`, noEmit.

# 3D model

- `Keyboard.jsx` at repo root is **auto-generated** by `gltfjsx` — **do not edit manually**. Regenerate with:
  ```
  npx gltfjsx@6.5.3 public/models/keyboard.glb
  ```
- The file is `.jsx` (not `.tsx`), so it lacks full type safety — adjust types manually if you modify it.
- Known quirk: the glTF includes an empty-string node name (`nodes['']`). This is fragile and may need manual handling after regeneration.
- **Regeneration hazard** — after regenerating, verify that `useGLTF` and `useGLTF.preload` use the same path (both should be `/models/keyboard.glb`). The generator may produce mismatched paths.
- The model file is `public/models/keyboard.glb`.

# Shared instructions

- `CLAUDE.md` exists and references this file via `@AGENTS.md`. Keep both in sync.

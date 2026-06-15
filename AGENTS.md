# Project

3D mechanical keyboard configurator — Next.js 16.2.9, React 19.2.4, Three.js 0.184 + `@react-three/fiber` 9.6.1 + `@react-three/drei` 10.7.7.
Single-page app: `app/page.tsx` (RSC) → `app/Scene.tsx` (`"use client"` boundary) → `@/Keyboard` (glTF model).
Only `Scene.tsx` and `ConfiguratorPanel.tsx` are client components.

# Commands

- `npm run dev` — dev server on localhost:3000
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)
- `npx tsc --noEmit` — TypeScript type-check (no npm script)
- **Always `npm run lint` then `npx tsc --noEmit` before committing.** No test framework configured.

# Toolchain quirks

- **Tailwind CSS v4** — `@import "tailwindcss"` (not `@tailwind` directives). Custom tokens in `@theme inline { ... }`.
- **PostCSS** — `postcss.config.mjs` with `@tailwindcss/postcss` plugin.
- **ESLint** — flat config using `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. Ignores `.next/`, `out/`, `build/`, `next-env.d.ts`.
- **Path alias** — `@/*` maps to project root.
- **TypeScript** — `strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `noEmit: true`.
- **Next.js bundled docs** — read `node_modules/next/dist/docs/` before writing code for breaking changes.
- **R3F skill** — load the `react-three-fiber` skill for Three.js patterns, pitfalls, and Drei helpers.

# glTF model (`Keyboard.jsx`)

- **Auto-generated** by `gltfjsx` — do not edit manually. Regenerate with:
  ```
  npx gltfjsx@6.5.3 public/models/keyboard.glb
  ```
- Named export (`export function Model`), not default. File is `.jsx` (no type safety).
- **Regeneration hazard** — after regenerating, verify `useGLTF` and `useGLTF.preload` use the same path (both should be `/models/keyboard.glb`).
- Models: `public/models/keyboard.glb` (keys + base), `public/models/floor.glb` (ground plane, preloaded via `useGLTF` in Scene.tsx).

# Material customization (`Scene.tsx`)

All material setup is in a `useLayoutEffect` that traverses the loaded glTF. Three named materials: `keys_light`, `keys_dark`, `base`.

- **Key labels** — `createLabelMap()` composites `keys.webp` (mask) with two colors per pixel via Canvas. Light keys get `#E7A779` bg / `#663919` labels; dark keys get the inverse. Applied as `mat.map` with `mat.color = 0xffffff`.
- **Key roughness** — `keys_roughness.jpg` doubles as `roughnessMap` and `bumpMap` (`bumpScale`: 1 for `keys_light`, 2 for `keys_dark`).
- **Base** — uses `base_roughness.webp` for `roughnessMap` and `bumpMap` (`bumpScale`: 0.3). Optional color set via `base` prop.
- **AO map** — `ao.webp` loaded, cloned with `flipY = false`, `channel = 1` (reads `uv1` = TEXCOORD_1 from the glTF). Applied to all three materials.

Texture files: `public/textures/keyboard/` contains `ao.webp`, `keys.webp`, `keys_roughness.jpg`, `base_roughness.webp`, `base_roughness.jpg` (legacy, unused).

# Dark keys customization

- **Toggle** — `darkKeysEnabled` state in `Scene.tsx` controls whether dark key material is used at all. When off, all keys use the `keys_light` material.
- **Add/Remove modes** — `darkKeyMode` (`"add"` | `"remove"` | `"idle"`) controls interaction mode. In `"add"` mode, clicking a light key makes it dark; in `"remove"` mode, clicking a dark key makes it light.
- **Custom selection** — `customDarkKeys: string[] | null` tracks user-selected dark key names. `null` = use model's original assignment. Non-null = explicit set.
- **Initialization** — `originallyDarkRef` records each key's original material (`keys_light` vs `keys_dark`) from the glTF on mount, used as fallback when `customDarkKeys` is `null`.
- **Material switching** — A `useLayoutEffect` traverses the model and sets each key mesh's `.material` to `materials.keys_light` or `materials.keys_dark` based on the current configuration. Both materials are already fully customized (labels, AO, roughness, bump) by a prior effect.
- **Cursor** — Viewport gets `cursor-crosshair` when in add/remove mode.
- **Key press is disabled** while in selection mode — pointer down toggles the key state instead of animating a press.

# Other

- `CLAUDE.md` references this file via `@AGENTS.md` — keep them in sync.
- Keystroke audio: `public/audio/single_key.wav`.
- Loading spinner: `public/keyboard_loading.svg`.

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# transparent-video-react

## What This Project Is
A React component library for playing stacked-alpha transparent videos. Uses WebGL to composite RGB and alpha from a single stacked video file into real-time transparent video output. Based on [Jake Archibald's research](https://jakearchibald.com/2024/video-with-transparency/).

## Tech Stack
TypeScript (strict), React 18.2+/19.0+, WebGL 1.0, Vite 7 (library mode), Storybook 8, Vitest + Playwright, ESLint + Prettier, pnpm, Conventional Commits + semantic-release.

## Key Architecture
- **`TransparentVideo`** — Main component (forwardRef), renders a hidden `<video>` + visible `<canvas>`
- **`gl-helper.ts`** — WebGL shader composites top-half RGB + bottom-half alpha from stacked video
- **Frame sync** — `requestVideoFrameCallback` preferred, `requestAnimationFrame` fallback
- **Resize** — Debounced (100ms) via shared `ResizeObserver`, supports fill/contain/cover
- **DPR** — `matchMedia`-based pixel ratio monitoring for HiDPI
- **Canvas resolution** — Capped at `min(videoSize, containerSize * DPR)`

## Source Layout
```
src/
├── index.ts                 # Public API
├── TransparentVideo.tsx     # Main component
├── TransparentVideo.types.ts
├── TransparentVideo.css     # @layer transparent-video
├── gl-helper.ts             # WebGL core
├── useDevicePixelRatio.ts   # DPR hook
├── useResizeObserver.ts     # Shared ResizeObserver hook
├── utils.ts
├── stories/                 # Storybook stories
└── assets/                  # Demo videos
```

Build output: `lib/` (ESM `.mjs`, CJS `.cjs`, CSS, TypeScript declarations in `types/`).

## Commands
- `pnpm dev` — Dev server
- `pnpm build` — Library build
- `pnpm storybook` — Storybook (port 6006)
- `pnpm test` — Vitest in Playwright Chromium
- `pnpm lint` / `pnpm format` — Linting and formatting
- `pnpm typecheck` — Type checking

## Conventions
- Functional components + hooks, no classes
- PascalCase components, camelCase hooks, kebab-case files
- Internal state in `useRef` to avoid re-renders
- Conventional Commits, 80%+ test coverage target

## Specs
See `openspec/specs/` for capability specifications:
- **core-rendering** — WebGL compositing, frame sync, context management
- **component-api** — Props, ref API, source handling
- **responsive-display** — Object-fit, HiDPI, resize
- **build-and-distribution** — Module formats, CSS, types

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

# Repository Guidelines

## Project Overview
`transparent-video-react` is a React component library for playing stacked-alpha transparent videos using WebGL. It wraps Jake Archibald's stacked-alpha video technique into a React-friendly API with features like responsive sizing, HiDPI support, and `object-fit` modes.

## Project Structure & Module Organization
Library source code lives in `src/`. The public API is exported through `src/index.ts`. Key modules:

| Module | Purpose |
|--------|---------|
| `TransparentVideo.tsx` | Main React component (forwardRef) |
| `TransparentVideo.types.ts` | TypeScript type definitions |
| `TransparentVideo.css` | Component styles (`@layer transparent-video`) |
| `gl-helper.ts` | WebGL context, shaders, frame drawing |
| `useDevicePixelRatio.ts` | DPR monitoring hook |
| `useResizeObserver.ts` | Shared ResizeObserver hook |
| `utils.ts` | Utility functions |

Storybook stories live in `src/stories/`. Demo video assets in `src/assets/`. Build output goes to `lib/` (ESM `.mjs`, CJS `.cjs`, CSS, and `types/`).

## Build, Test, and Development Commands
Use **pnpm** for all workflows:

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Library build → `lib/` |
| `pnpm storybook` | Storybook dev (port 6006) |
| `pnpm build-storybook` | Build Storybook |
| `pnpm test` | Run Vitest (Playwright Chromium) |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm typecheck` | TypeScript type checking |

## Coding Style & Naming Conventions
- TypeScript with strict settings
- Functional React components + hooks only (no class components)
- Internal state stored in `useRef` to avoid unnecessary re-renders
- PascalCase for components (`TransparentVideo`), camelCase for hooks/utilities (`useDevicePixelRatio`), kebab-case for non-component filenames (`gl-helper.ts`)
- CSS uses `@layer transparent-video` for encapsulation
- Run Prettier and ESLint before committing

## Architecture Key Points
- **WebGL pipeline:** Fragment shader reads top half (RGB) and bottom half (alpha) of stacked video, composites transparent output
- **Frame sync:** `requestVideoFrameCallback` preferred, `requestAnimationFrame` fallback
- **Resize:** Debounced (100ms) container resize via shared global `ResizeObserver`
- **DPR:** `matchMedia`-based device pixel ratio tracking
- **Canvas resolution:** Capped at `min(videoSize, containerSize * DPR)` for performance
- **Object-fit:** fill / contain / cover implemented via CSS transform `scale()`

## Testing Guidelines
Tests run in headless Playwright Chromium browser via Vitest + Storybook addon-vitest. Storybook stories serve as both documentation and visual test cases. Target 80%+ meaningful coverage. Run `pnpm test` before merging.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) for semantic-release. Keep commits focused and descriptive. PRs should include summary, testing notes, related issue links, and Storybook screenshots/GIFs for UI changes. CI must pass before merging.

## Specs
Initial capability specs are defined in `openspec/specs/`:
- **core-rendering** — WebGL alpha compositing, frame sync, context management
- **component-api** — Declarative props, imperative ref API, source handling
- **responsive-display** — Object-fit modes, HiDPI support, resize handling
- **build-and-distribution** — Dual module format, CSS output, TypeScript declarations

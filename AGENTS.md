# Repository Guidelines

## Project Structure & Module Organization
Place library code under `src/`. Create feature folders such as `src/transparent-video/` and `src/hooks/`, and export the public API through `src/index.ts`. Store Storybook stories in `stories/` and sample media in `public/transparent-video/`. Keep generated artifacts (`dist/`, coverage outputs) out of the repo by extending `.gitignore`.

## Build, Test, and Development Commands
Use pnpm for all workflows. Run `pnpm install` before any change. `pnpm dev` should start the Vite or Storybook preview server once the scripts are wired to `vite dev` or `storybook dev`. `pnpm build` must run the Vite library build and emit `/dist`. Keep `pnpm test` wired to Jest, and fail fast if required suites are missing.

## Coding Style & Naming Conventions
Write TypeScript with strict settings as the default. Favour functional React components and hooks. Use PascalCase for components (`TransparentVideo`), camelCase for hooks/utilities, and kebab-case for non-component filenames (`alpha-mixer.ts`). Run Prettier and ESLint (`pnpm format`, `pnpm lint`) before committing to ensure consistent style.

## Testing Guidelines
Author Jest + React Testing Library specs under `src/**/__tests__/` or alongside code as `*.test.tsx`. Name suites after the component under test and cover compositing behaviour, fallback sources, and imperative APIs. Target meaningful coverage (80%+) and update snapshots only when UI changes are intentional. Execute `pnpm test -- --coverage` prior to merge.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) so semantic-release can infer releases. Keep commits focused and descriptive (e.g., `feat: add alpha channel blend hook`). Pull requests should include a clear summary, testing notes, related issue links, and Storybook screenshots or GIFs for UI updates. Request review only after CI passes and the branch rebases cleanly onto `main`.

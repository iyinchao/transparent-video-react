# Project Context

## Purpose
`transparent-video-react` is a React component library for playing "stacked-alpha" transparent videos. It is based on Jake Archibald's research ([article](https://jakearchibald.com/2024/video-with-transparency/), [repo](https://github.com/jakearchibald/transparent-video)). The technique encodes a video's color frames and alpha channel frames stacked vertically in a single standard video file, then uses a WebGL shader on a `<canvas>` to composite them in real-time, producing video with per-pixel transparency.

The library wraps this technique into a drop-in React component (`<TransparentVideo>`) with a familiar `<video>`-like API, adding React-specific optimizations and enhanced features such as responsive sizing, HiDPI support, and `object-fit` modes.

**Repository:** https://github.com/iyinchao/transparent-video-react
**Author:** iyinchao
**License:** MIT

## Tech Stack
- **Language:** TypeScript (strict mode)
- **UI Framework:** React 18.2+ / 19.0+ (peer dependency)
- **Rendering:** WebGL 1.0 (fragment shader for alpha compositing)
- **Build Tool:** Vite 7 (library mode)
- **Type Generation:** vite-plugin-dts
- **Package Manager:** pnpm
- **Component Preview:** Storybook 8 (@storybook/react-vite)
- **Testing:** Vitest + Storybook addon-vitest (Playwright Chromium browser)
- **Linting:** ESLint (flat config) + TypeScript ESLint + React / JSX A11y plugins
- **Formatting:** Prettier
- **Release:** Conventional Commits + semantic-release

## Project Conventions

### Code Style
- Functional React components with hooks (no class components)
- `forwardRef` + `useImperativeHandle` for exposing imperative APIs
- PascalCase for component names (`TransparentVideo`, `TransparentVideoSource`)
- camelCase for hooks and utilities (`useDevicePixelRatio`, `useResizeObserver`)
- kebab-case for non-component filenames (`gl-helper.ts`, `env.d.ts`)
- CSS uses `@layer transparent-video` for encapsulation
- Internal state stored in `useRef` to avoid unnecessary re-renders
- Prettier + ESLint enforced before commits

### Architecture Patterns
- **Single-component library:** One main component (`TransparentVideo`) with a companion (`TransparentVideoSource`) exposed as a static property
- **WebGL rendering pipeline:** A fragment shader reads the top half of the stacked video for RGB color and the bottom half for alpha, compositing them into transparent output
- **Shared observers:** A single global `ResizeObserver` instance shared across all component instances via a custom hook
- **DPR monitoring:** `matchMedia`-based device pixel ratio tracking for HiDPI rendering
- **Debounced resize:** 100ms debounce on container resize to avoid excessive redraws
- **Custom Vite plugin:** `injectCssImport` automatically adds CSS import statements into built JS output

### Source Code Layout
```
src/
├── index.ts                    # Public API entry point
├── TransparentVideo.tsx        # Main component (forwardRef)
├── TransparentVideo.types.ts   # TypeScript type definitions
├── TransparentVideo.css        # Component CSS (@layer)
├── gl-helper.ts                # WebGL context, shaders, drawing
├── useDevicePixelRatio.ts      # DPR monitoring hook
├── useResizeObserver.ts        # Shared ResizeObserver hook
├── utils.ts                    # Utility functions
├── env.d.ts                    # Vite module declarations
├── assets/                     # Demo video files (.mp4)
└── stories/                    # Storybook stories and docs
```

### Build Output
```
lib/
├── transparent-video-react.mjs   # ES Module
├── transparent-video-react.cjs   # CommonJS
├── transparent-video-react.css   # Component styles
└── types/                        # TypeScript declarations
```

### Testing Strategy
- Tests run in real browser (headless Playwright Chromium) via Vitest + Storybook
- Storybook stories serve as both documentation and visual test cases
- Target 80%+ meaningful code coverage
- Run `pnpm test` before merging

### Git Workflow
- Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- semantic-release for automated versioning and changelog
- Feature branches merged into `main`
- CI via GitHub Actions

## Domain Context

### Stacked-Alpha Video Technique
A standard video file (H.264, HEVC, or AV1) is prepared using FFmpeg so that:
- The **top half** contains the original RGB color frames
- The **bottom half** contains the alpha channel encoded as grayscale

At runtime, a WebGL fragment shader samples both halves and outputs `vec4(rgb, alpha)`, producing true per-pixel transparency on a `<canvas>` element. The hidden `<video>` element drives playback; `requestVideoFrameCallback` (with fallback) synchronizes frame updates to the canvas.

### Codec Support
Multiple `<source>` elements allow progressive enhancement:
- AV1 (`av01.*`) — best compression, growing support
- HEVC (`hvc1.*`) — wide hardware support on Apple devices
- H.264 — universal fallback

### Premultiplied Alpha
The component supports an optional `premultipliedAlpha` mode where RGB values in the source video are pre-multiplied by alpha, which can reduce edge artifacts in certain encoding pipelines.

## Important Constraints
- WebGL is required (no software fallback)
- Video must be prepared in stacked-alpha format (color on top, alpha on bottom)
- The hidden `<video>` element is twice the visible height (stacked frames)
- `requestVideoFrameCallback` is preferred but not universally available; a 100ms `setTimeout` fallback is used
- Canvas resolution is capped at `min(videoSize, containerSize * DPR)` for performance

## External Dependencies
- **React** (peer): 18.2+ or 19.0+
- **No other runtime dependencies** — the library is self-contained
- **Build-time:** Vite, vite-plugin-dts, Storybook, ESLint, Prettier, Vitest

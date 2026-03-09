# Change: Add WebGL Context Error Handling and Degradation Events

## Why
Currently, WebGL context creation failure throws an unhandled error that crashes the component. Context lost/restored events (`webglcontextlost` / `webglcontextrestored`) are not handled at all. Consumers have no way to detect these failures and provide fallback UI or recovery logic.

## What Changes
- Add `onContextEvent` callback prop to notify consumers of WebGL context lifecycle events (creation failed, context lost, context restored)
- Add internal `glAvailable` state flag to guard rendering when context is unavailable
- Listen for `webglcontextlost` and `webglcontextrestored` canvas events
- Wrap `setupGLContext` in try-catch to handle creation failure gracefully
- Expose `glAvailable` on the imperative ref API for external state queries
- Add context lost/restored simulation controls to the KitchenSink storybook demo

## Impact
- Affected specs: `core-rendering`, `component-api`
- Affected code: `TransparentVideo.tsx`, `TransparentVideo.types.ts`, `stories/main.stories.tsx`, `stories/main.css`

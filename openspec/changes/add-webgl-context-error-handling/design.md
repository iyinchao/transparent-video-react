## Context
WebGL contexts can become unavailable due to: GPU resource exhaustion, driver resets, device sleep/wake cycles, GPU process crashes, or environments that don't support WebGL at all. The component currently has no resilience for these scenarios.

## Goals / Non-Goals
- Goals:
  - Gracefully handle WebGL context creation failure without crashing the component
  - Detect and respond to runtime context lost/restored events
  - Provide a single event callback for consumers to implement degradation/recovery UIs
  - Expose context availability state on the imperative ref
- Non-Goals:
  - Automatic fallback rendering (e.g., showing the raw video) — left to consumers
  - Retry logic for context creation — consumers can remount if desired

## Decisions

### Single unified callback vs multiple callbacks
- **Decision**: Single `onContextEvent({ type, message })` callback
- **Alternatives**: Separate `onContextLost` / `onContextRestored` / `onContextCreationFailed` props
- **Rationale**: These events belong to the same lifecycle chain. A single callback is simpler, more extensible, and easier for consumers to handle uniformly (e.g., show/hide fallback UI based on `type`).

### Internal `glAvailable` flag
- **Decision**: Add `glAvailable: boolean` to `stateRef` to track GL availability
- **Rationale**: After `webglcontextlost`, the context object still exists but is unusable. Existing `if (!context)` guards don't catch this. The flag provides correct state tracking for all rendering paths.

### Context restored handling (Strategy A — passive wait)
- **Decision**: Listen for `webglcontextrestored` and rebuild GL resources automatically
- **Alternatives**: Only notify on lost, let consumers handle recovery via remount
- **Rationale**: Low implementation cost (few lines of event listener code), avoids unnecessary DOM remounting and video reloading, gives consumers more information about recovery state.

### Storybook testing via WEBGL_lose_context extension
- **Decision**: Use `WEBGL_lose_context` extension obtained from `canvas.getContext()` in the story
- **Alternatives**: Expose GL context on ref API, add internal `__disableGL` prop
- **Rationale**: Same canvas always returns the same context object, so the extension can be obtained externally. No need to pollute the component API for testing purposes. Context creation failure simulation is deferred — only context lost/restored is tested in the KitchenSink story.

## Risks / Trade-offs
- `webglcontextrestored` timing is browser-controlled and non-deterministic — consumers should not rely on guaranteed recovery
- `e.preventDefault()` must be called in the `contextlost` handler to allow the browser to attempt restoration
- During context restoration, GL resources must be fully rebuilt (program, shaders, buffers, textures)

## Open Questions
- None; design decisions were discussed and confirmed before proposal creation.

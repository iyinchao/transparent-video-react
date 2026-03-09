## 1. Type Definitions
- [x] 1.1 Add `WebGLContextEventType` and `WebGLContextEvent` types to `TransparentVideo.types.ts`
- [x] 1.2 Add `onContextEvent` prop to `TransparentVideoProps`
- [x] 1.3 Add `readonly glAvailable: boolean` to `TransparentVideoRef`

## 2. Core Context Error Handling
- [x] 2.1 Add `glAvailable` flag to `stateRef` in `TransparentVideo.tsx`
- [x] 2.2 Wrap `setupGLContext` call in try-catch, fire `creation-failed` event on failure and early return
- [x] 2.3 Add `webglcontextlost` event listener: call `preventDefault()`, set `glAvailable = false`, stop render loop, fire `context-lost` event
- [x] 2.4 Add `webglcontextrestored` event listener: rebuild GL resources, restore rendering state, fire `context-restored` event (or `creation-failed` if rebuild fails)
- [x] 2.5 Add `glAvailable` guard to all rendering paths (`drawVideo`, `clearCanvas`, resize handler)
- [x] 2.6 Clean up event listeners in `useLayoutEffect` cleanup
- [x] 2.7 Expose `glAvailable` on the imperative ref via `useImperativeHandle`

## 3. Storybook Demo
- [x] 3.1 Add context lost/restored simulation controls (Simulate Context Lost / Simulate Context Restore buttons) and GL status indicator to the KitchenSink story
- [x] 3.2 Add event log display showing `onContextEvent` callbacks in the KitchenSink story

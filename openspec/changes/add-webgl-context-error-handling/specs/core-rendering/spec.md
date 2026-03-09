## MODIFIED Requirements

### Requirement: WebGL Context Management
The library SHALL efficiently manage WebGL context creation and cleanup. The library SHALL handle context creation failure, context loss, and context restoration gracefully without crashing the component.

#### Scenario: Context creation
- **Given** the component mounts with a canvas element
- **When** WebGL initialization occurs
- **Then** a WebGL 1.0 context is created with appropriate attributes (alpha enabled, antialias enabled)

#### Scenario: Context creation failure
- **Given** the component mounts with a canvas element
- **When** `getContext('webgl2')` and `getContext('webgl')` both return null
- **Then** the component SHALL NOT crash, SHALL set `glAvailable` to `false`, SHALL fire an `onContextEvent` callback with type `creation-failed`, and SHALL skip all subsequent GL-dependent setup

#### Scenario: Context lost at runtime
- **Given** the component has an active WebGL context and is rendering
- **When** a `webglcontextlost` event fires on the canvas
- **Then** the component SHALL call `preventDefault()` on the event, set `glAvailable` to `false`, stop the rendering loop, and fire an `onContextEvent` callback with type `context-lost`

#### Scenario: Context restored at runtime
- **Given** the component has a lost WebGL context (after `webglcontextlost`)
- **When** a `webglcontextrestored` event fires on the canvas
- **Then** the component SHALL destroy old GL resources, recreate the GL context and resources via `setupGLContext`, set `glAvailable` to `true`, restore rendering state (resize + resume playback if playing), and fire an `onContextEvent` callback with type `context-restored`

#### Scenario: Context restoration failure
- **Given** the component has a lost WebGL context
- **When** a `webglcontextrestored` event fires but `setupGLContext` throws
- **Then** the component SHALL set `glAvailable` to `false` and fire an `onContextEvent` callback with type `creation-failed`

#### Scenario: Context cleanup on unmount
- **Given** the component is mounted and has an active WebGL context
- **When** the component unmounts
- **Then** all WebGL resources (textures, buffers, programs) SHALL be released, the context lost, and `webglcontextlost` / `webglcontextrestored` event listeners SHALL be removed

#### Scenario: Video source change
- **Given** the component is displaying a video
- **When** the video source changes
- **Then** the WebGL pipeline SHALL reinitialize to handle the new video dimensions

#### Scenario: GL availability guard
- **Given** `glAvailable` is `false` (due to creation failure or context loss)
- **When** any rendering path is triggered (draw, resize, clear)
- **Then** the rendering operation SHALL be skipped without error

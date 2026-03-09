## MODIFIED Requirements

### Requirement: Declarative Props
The `TransparentVideo` component SHALL accept declarative props similar to the HTML `<video>` element.

#### Scenario: Standard video props
- **Given** a `TransparentVideo` component is rendered
- **When** props like `autoPlay`, `loop`, `muted`, `playsInline`, `preload`, `crossOrigin` are provided
- **Then** they SHALL be passed through to the underlying hidden `<video>` element

#### Scenario: Custom event handlers
- **Given** a `TransparentVideo` component is rendered
- **When** event handlers like `onPlay`, `onPause`, `onEnded`, `onTimeUpdate`, `onLoadedMetadata`, `onError` are provided
- **Then** they SHALL be forwarded to the underlying `<video>` element's corresponding events

#### Scenario: Premultiplied alpha prop
- **Given** a `TransparentVideo` component is rendered with `premultipliedAlpha={true}`
- **When** the WebGL context is initialized
- **Then** premultiplied alpha blending SHALL be enabled in the shader and context

#### Scenario: WebGL context event callback
- **Given** a `TransparentVideo` component is rendered with an `onContextEvent` callback
- **When** a WebGL context lifecycle event occurs (creation failed, context lost, or context restored)
- **Then** the `onContextEvent` callback SHALL be invoked with an object containing `type` (`'creation-failed'` | `'context-lost'` | `'context-restored'`) and a human-readable `message` string

### Requirement: Imperative Ref API
The component SHALL expose an imperative API via `React.forwardRef` and `useImperativeHandle`.

#### Scenario: Play control
- **Given** a ref to the `TransparentVideo` component
- **When** `ref.current.play()` is called
- **Then** the underlying video SHALL start playback and the canvas SHALL begin rendering frames

#### Scenario: Pause control
- **Given** a ref to the `TransparentVideo` component
- **When** `ref.current.pause()` is called
- **Then** the underlying video SHALL pause and canvas rendering SHALL stop

#### Scenario: Seek control
- **Given** a ref to the `TransparentVideo` component
- **When** `ref.current.seek(timeInSeconds)` is called
- **Then** the video SHALL seek to the specified time and render the corresponding frame

#### Scenario: Force update
- **Given** a ref to the `TransparentVideo` component
- **When** `ref.current.forceUpdate()` is called
- **Then** the current video frame SHALL be re-drawn to the canvas immediately

#### Scenario: Playing state query
- **Given** a ref to the `TransparentVideo` component
- **When** `ref.current.isPlaying` is accessed
- **Then** it SHALL return `true` if the video is currently playing, `false` otherwise

#### Scenario: Access underlying elements
- **Given** a ref to the `TransparentVideo` component
- **When** `ref.current.getVideoElement()` or `ref.current.getCanvasElement()` is called
- **Then** the corresponding DOM element SHALL be returned

#### Scenario: GL availability query
- **Given** a ref to the `TransparentVideo` component
- **When** `ref.current.glAvailable` is accessed
- **Then** it SHALL return `true` if the WebGL context is available and usable, `false` if context creation failed or context is lost

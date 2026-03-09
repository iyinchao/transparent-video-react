# Capability: Core Rendering

Renders stacked-alpha video frames with per-pixel transparency using WebGL.

## Status: Active

## Requirements

### Requirement: WebGL Alpha Compositing
The library SHALL use a WebGL 1.0 fragment shader to composite transparent video from stacked-alpha source frames. The shader SHALL sample the top half of the video texture for RGB color and the bottom half for alpha channel values, outputting `vec4(rgb, alpha)`.

#### Scenario: Standard alpha compositing
- **Given** a stacked-alpha video where color is in the top half and alpha is in the bottom half
- **When** a frame is rendered to the canvas
- **Then** the fragment shader samples RGB from the top half and alpha from the bottom half, producing a transparent composite

#### Scenario: Premultiplied alpha mode
- **Given** the `premultipliedAlpha` prop is set to `true`
- **When** a frame is rendered to the canvas
- **Then** the shader outputs RGB values pre-multiplied by the alpha channel, and the WebGL context uses premultiplied alpha blending

#### Scenario: Non-premultiplied alpha mode (default)
- **Given** the `premultipliedAlpha` prop is not set or is `false`
- **When** a frame is rendered to the canvas
- **Then** the shader outputs straight (non-premultiplied) RGB and alpha values

### Requirement: Frame Synchronization
The library SHALL synchronize canvas rendering with video playback frames.

#### Scenario: Browser supports requestVideoFrameCallback
- **Given** the browser supports `requestVideoFrameCallback`
- **When** the video is playing
- **Then** each new video frame triggers a canvas redraw via the callback

#### Scenario: Fallback frame sync
- **Given** the browser does not support `requestVideoFrameCallback`
- **When** the video is playing
- **Then** a `requestAnimationFrame` loop SHALL be used as fallback to keep the canvas in sync

### Requirement: First Frame Rendering
The library SHALL render the first frame of the video to the canvas as soon as the video data is available.

#### Scenario: First frame with requestVideoFrameCallback
- **Given** the browser supports `requestVideoFrameCallback`
- **When** the video metadata is loaded and sufficient data is available
- **Then** the first frame is drawn to the canvas using the callback

#### Scenario: First frame fallback
- **Given** the browser does not support `requestVideoFrameCallback`
- **When** the video metadata is loaded
- **Then** a 100ms `setTimeout` fallback SHALL be used to draw the first frame

### Requirement: WebGL Context Management
The library SHALL efficiently manage WebGL context creation and cleanup.

#### Scenario: Context creation
- **Given** the component mounts with a canvas element
- **When** WebGL initialization occurs
- **Then** a WebGL 1.0 context is created with appropriate attributes (alpha enabled, antialias enabled)

#### Scenario: Context cleanup on unmount
- **Given** the component is mounted and has an active WebGL context
- **When** the component unmounts
- **Then** all WebGL resources (textures, buffers, programs) SHALL be released and the context lost

#### Scenario: Video source change
- **Given** the component is displaying a video
- **When** the video source changes
- **Then** the WebGL pipeline SHALL reinitialize to handle the new video dimensions

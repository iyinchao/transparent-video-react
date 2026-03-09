# Capability: Responsive Display

Handles canvas sizing, DPR awareness, and object-fit modes for responsive rendering.

## Status: Active

## Requirements

### Requirement: Object-Fit Modes
The component SHALL support CSS-like `object-fit` behavior for the canvas within its container.

#### Scenario: fill mode
- **Given** `objectFit="fill"` (or default)
- **When** the component renders
- **Then** the canvas SHALL stretch to fill the entire container, ignoring the video's aspect ratio

#### Scenario: contain mode
- **Given** `objectFit="contain"`
- **When** the component renders
- **Then** the canvas SHALL scale uniformly to fit within the container while preserving the video's aspect ratio, with letterboxing as needed

#### Scenario: cover mode
- **Given** `objectFit="cover"`
- **When** the component renders
- **Then** the canvas SHALL scale uniformly to cover the entire container while preserving the video's aspect ratio, cropping overflow content

### Requirement: HiDPI / Retina Support
The component SHALL render at the appropriate resolution for the display's device pixel ratio (DPR).

#### Scenario: Standard DPR display
- **Given** a display with DPR of 1
- **When** the canvas is sized
- **Then** the canvas resolution SHALL match the CSS pixel dimensions of the container

#### Scenario: HiDPI display
- **Given** a display with DPR of 2
- **When** the canvas is sized
- **Then** the canvas resolution SHALL be doubled (2x CSS pixels) for sharp rendering

#### Scenario: DPR change at runtime
- **Given** the device pixel ratio changes (e.g., window moved between displays)
- **When** the `matchMedia` listener detects the change
- **Then** the canvas resolution SHALL be recalculated and the frame re-rendered

### Requirement: Container Resize Handling
The component SHALL respond to container size changes.

#### Scenario: Container resized
- **Given** a mounted `TransparentVideo` whose container changes size
- **When** the `ResizeObserver` detects the change
- **Then** the canvas SHALL be re-sized with a 100ms debounce to avoid excessive redraws

#### Scenario: Shared ResizeObserver
- **Given** multiple `TransparentVideo` instances on the same page
- **When** any container resizes
- **Then** a single shared `ResizeObserver` instance SHALL be used across all instances for efficiency

### Requirement: Optimized Rendering Resolution
The component SHALL cap the canvas rendering resolution for performance.

#### Scenario: Small container, large video
- **Given** a container smaller than the video's native dimensions
- **When** computing the canvas buffer size
- **Then** the buffer size SHALL be `min(videoSize, containerSize * DPR)` to avoid rendering at unnecessarily high resolution

#### Scenario: Large container, small video
- **Given** a container larger than the video's native dimensions
- **When** computing the canvas buffer size
- **Then** the buffer size SHALL not exceed the video's native dimensions (upscaling is done via CSS transform)

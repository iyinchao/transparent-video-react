# Capability: Build and Distribution

Defines how the library is built, packaged, and distributed to consumers.

## Status: Active

## Requirements

### Requirement: Dual Module Format Output
The build SHALL produce both ES Module and CommonJS outputs.

#### Scenario: ES Module output
- **Given** the library is built with `pnpm build`
- **When** the build completes
- **Then** an ES Module file (`lib/transparent-video-react.mjs`) SHALL be produced

#### Scenario: CommonJS output
- **Given** the library is built with `pnpm build`
- **When** the build completes
- **Then** a CommonJS file (`lib/transparent-video-react.cjs`) SHALL be produced

### Requirement: CSS Output
The build SHALL produce a standalone CSS file that is automatically imported.

#### Scenario: CSS extraction
- **Given** the library is built
- **When** the build completes
- **Then** a CSS file (`lib/transparent-video-react.css`) SHALL be produced containing component styles

#### Scenario: CSS auto-import
- **Given** a consumer imports the library in JS
- **When** bundling occurs
- **Then** the JS output SHALL include an import statement for the CSS file (injected by the custom Vite plugin)

### Requirement: TypeScript Declarations
The build SHALL generate TypeScript declaration files.

#### Scenario: Declaration generation
- **Given** the library is built
- **When** the build completes
- **Then** `.d.ts` files SHALL be generated in `lib/types/` preserving JSDoc comments

### Requirement: External Peer Dependencies
React SHALL be externalized and declared as a peer dependency.

#### Scenario: React externalization
- **Given** the build configuration
- **When** Vite bundles the library
- **Then** `react`, `react-dom`, and `react/jsx-runtime` SHALL be excluded from the bundle

#### Scenario: Peer dependency range
- **Given** a consumer's project
- **When** installing the library
- **Then** the library SHALL require React 18.2+ or React 19.0+ as a peer dependency

### Requirement: Source Maps
The build SHALL include source maps for debugging.

#### Scenario: Source map generation
- **Given** the library is built
- **When** the build completes
- **Then** source maps SHALL be generated alongside the output files

import { type CSSProperties, type ReactElement, type SourceHTMLAttributes } from 'react';

/**
 * Props for the TransparentVideoSource component.
 * Extends standard HTML source element attributes.
 */
export interface TransparentVideoSourceProps extends SourceHTMLAttributes<HTMLSourceElement> {
  /**
   * URL of the video source.
   */
  src?: string;
  /**
   * Type of the video (e.g., video/mp4).
   */
  type?: string;
}

type TransparentVideoSourceElement = ReactElement<
  TransparentVideoSourceProps,
  (props: TransparentVideoSourceProps) => ReactElement
>;

/**
 * Ref handle exposed by the TransparentVideo component.
 * Use this to control the video playback and access the underlying elements.
 */
export interface TransparentVideoRef {
  /**
   * Play the video.
   */
  play: () => void;

  /**
   * Pause the video.
   */
  pause: () => void;

  /**
   * Seek to a specific time in the video.
   * @param time - The time in seconds to seek to.
   */
  seek: (time: number) => void;

  /**
   * Force draw the video to the canvas.
   */
  forceUpdate: (resize?: boolean) => void;

  /**
   * Whether the video is currently playing.
   */
  readonly isPlaying: boolean;

  /**
   * Get the underlying HTMLVideoElement.
   * @returns The video element, or null if not yet mounted.
   */
  getVideoElement: () => HTMLVideoElement | null;

  /**
   * Get the underlying HTMLCanvasElement used for rendering.
   * @returns The canvas element, or null if not yet mounted.
   */
  getCanvasElement: () => HTMLCanvasElement | null;
}

/**
 * Props for the TransparentVideo component.
 */
export interface TransparentVideoProps {
  /**
   * CSS class name for the container element.
   */
  className?: string;

  /**
   * Inline CSS styles for the container element.
   */
  style?: CSSProperties;

  /**
   * Whether the video is muted.
   * @default undefined
   */
  muted?: boolean;

  /**
   * Whether the video plays automatically when the component mounts.
   * @default undefined
   */
  autoPlay?: boolean;

  /**
   * Whether the video loops when it reaches the end.
   * @default undefined
   */
  loop?: boolean;

  /**
   * Whether the video plays inline on mobile devices (iOS).
   * @default undefined
   */
  playsInline?: boolean;

  /**
   * Whether the source video uses premultiplied alpha.
   * Set this to `true` if semi-transparent areas or outlines look too dark.
   * @default false
   */
  preMultipliedAlpha?: boolean;

  /**
   * How the video is fitted to the container.
   * - `'contain'`: The video is scaled to fit within the container while maintaining aspect ratio.
   * - `'cover'`: The video is scaled to cover the entire container while maintaining aspect ratio.
   * - `'fill'`: The video is stretched to fill the entire container.
   * @default 'fill'
   */
  objectFit?: 'contain' | 'cover' | 'fill';

  /**
   * Additional HTML attributes to pass to the underlying video element.
   */
  videoProps?: React.HTMLProps<HTMLVideoElement>;

  /**
   * Additional HTML attributes to pass to the underlying canvas element.
   */
  canvasProps?: React.HTMLProps<HTMLCanvasElement>;

  /**
   * Video source elements. Can be a single source or an array of sources.
   * The browser will use the first compatible source.
   */
  children?: TransparentVideoSourceElement | TransparentVideoSourceElement[] | null;

  /**
   * Callback fired when the video play state changes.
   * @param isPlaying - Whether the video is currently playing.
   */
  onPlayStateChange?: (isPlaying: boolean) => void;
}

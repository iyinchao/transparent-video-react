import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  Children,
  isValidElement,
  type ReactElement,
  type SourceHTMLAttributes,
  type CSSProperties,
  useEffect,
} from 'react';

import {
  setupGLContext,
  setPremultipliedAlpha,
  drawVideo,
  destroyGLContext,
  setEnableClip,
  setClipRatio,
  clearCanvas,
} from './gl-helper';
import { videoIsPlaying } from './utils';

import './TransparentVideo.css';
import { useResizeObserver } from './useResizeObserver';
import { useDevicePixelRatio } from './useDevicePixelRatio';

/**
 * Ref handle exposed by the TransparentVideo component.
 * Use this to control the video playback and access the underlying elements.
 */
export interface TransparentVideoHandle {
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

/**
 * A source element for the TransparentVideo component.
 * Similar to the standard HTML `<source>` element, but with automatic refresh on source changes.
 *
 * @example
 * ```tsx
 * <TransparentVideo>
 *   <TransparentVideoSource src="video.mp4" type="video/mp4" />
 *   <TransparentVideoSource src="video.webm" type="video/webm" />
 * </TransparentVideo>
 * ```
 */
export const TransparentVideoSource = (props: TransparentVideoSourceProps) => {
  const ref = useRef<HTMLSourceElement>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const parentVideo = ref.current.closest('video');
    // refresh parent video
    if (parentVideo) {
      parentVideo.load();
    }
  }, [props.src, props.type]);
  return <source ref={ref} {...props} />;
};

type TransparentVideoSourceElement = ReactElement<
  TransparentVideoSourceProps,
  typeof TransparentVideoSource
>;

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

/**
 * A React component for playing stacked-alpha transparent videos.
 *
 * This component renders transparent video using WebGL compositing, based on Jake Archibald's research.
 * It automatically handles canvas resizing, HIDPI support, and provides a familiar video API.
 *
 * @example
 * ```tsx
 * import { TransparentVideo, TransparentVideoSource } from 'transparent-video-react';
 *
 * const MyComponent = () => {
 *   const videoRef = useRef<TransparentVideoHandle>(null);
 *
 *   return (
 *     <>
 *       <TransparentVideo
 *         ref={videoRef}
 *         autoPlay
 *         loop
 *         muted
 *         style={{ width: '100%', height: 'auto' }}
 *       >
 *         <TransparentVideoSource src="video.mp4" type="video/mp4" />
 *       </TransparentVideo>
 *       <button onClick={() => videoRef.current?.play()}>Play</button>
 *       <button onClick={() => videoRef.current?.pause()}>Pause</button>
 *     </>
 *   );
 * };
 * ```
 *
 * @see {@link TransparentVideoHandle} for available ref methods
 * @see {@link TransparentVideoProps} for available props
 */
export const TransparentVideo = forwardRef<TransparentVideoHandle, TransparentVideoProps>(
  (
    {
      className,
      style,
      muted,
      autoPlay,
      loop,
      playsInline,
      preMultipliedAlpha = false,
      objectFit = 'fill',
      canvasProps,
      videoProps,
      children,
      onPlayStateChange,
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stateRef = useRef<{
      lastVideoSrc: string;
      videoIsPlaying: boolean;
      videoEverPlayed: boolean;
      videoSize: { w: number; h: number } | null;
      rootSize: { w: number; h: number };
      dpr: number;
      canvasResizeValid: boolean;
      //
      context: WebGLRenderingContext | WebGL2RenderingContext | null;
      handleCanvasResize?: (sync?: boolean) => void;
      handlePlayStateChange?: () => void;
      //
      objectFit: typeof objectFit;
      preMultipliedAlpha: typeof preMultipliedAlpha;
      autoPlay: typeof autoPlay | null;
      onPlayStateChange: typeof onPlayStateChange;
    }>({
      lastVideoSrc: '',
      videoIsPlaying: false,
      videoEverPlayed: false,
      videoSize: null,
      rootSize: { w: 0, h: 0 },
      dpr: window.devicePixelRatio,
      canvasResizeValid: false,
      //
      context: null,
      //
      objectFit,
      preMultipliedAlpha,
      autoPlay: null,
      onPlayStateChange,
    });
    stateRef.current.onPlayStateChange = onPlayStateChange;

    useImperativeHandle<TransparentVideoHandle, TransparentVideoHandle>(ref, () => ({
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      seek: (time: number) => {
        if (!videoRef.current) {
          return;
        }
        videoRef.current.currentTime = time;
      },
      get isPlaying() {
        return stateRef.current.videoIsPlaying;
      },
      getVideoElement: () => videoRef.current,
      getCanvasElement: () => canvasRef.current,
    }));

    const { observe: observeResize } = useResizeObserver();
    const { observe: observeDPR } = useDevicePixelRatio();

    useLayoutEffect(() => {
      if (!canvasRef.current || !videoRef.current || !rootRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!stateRef.current.context) {
        stateRef.current.context = setupGLContext(canvas);
        setPremultipliedAlpha(stateRef.current.context, stateRef.current.preMultipliedAlpha);
      }

      const videoEvents = ['playing', 'stalled', 'emptied', 'ended', 'pause'] as const;
      const onVideoEvents = (e: Event) => {
        const target = e.target as HTMLVideoElement;
        const isPlaying = videoIsPlaying(target);
        if (stateRef.current.videoIsPlaying !== isPlaying) {
          stateRef.current.videoIsPlaying = isPlaying;
          stateRef.current.handlePlayStateChange?.();
          stateRef.current.onPlayStateChange?.(isPlaying);
        }
      };

      videoEvents.forEach((event) => {
        video.addEventListener(event, onVideoEvents);
      });

      // If initial state is not playing, wait for the first frame ready and draw
      let drawFirstFrameTimeout: ReturnType<typeof setTimeout> | null = null;
      const onLoadedData = () => {
        if (stateRef.current.videoEverPlayed) {
          return;
        }
        drawFirstFrameTimeout = setTimeout(() => {
          drawFirstFrameTimeout = null;
          if (stateRef.current.videoEverPlayed || !stateRef.current.context) {
            return;
          }
          // draw first frame
          drawVideo(stateRef.current.context, video);
          // NOTE: should wait some time to make sure the first frame is ready
          // otherwise the first frame will be blank
          // TODO: sometimes the first frame is still blank, find a better way to do this
        }, 100);
      };
      video.addEventListener('loadeddata', onLoadedData);

      // sync play state
      let raf: number = 0;
      let isPendingUpdate = false;
      stateRef.current.handlePlayStateChange = () => {
        if (isPendingUpdate) {
          return;
        }
        isPendingUpdate = true;
        queueMicrotask(() => {
          isPendingUpdate = false;
          if (stateRef.current.videoIsPlaying) {
            stateRef.current.videoEverPlayed = true;
            if (drawFirstFrameTimeout) {
              clearTimeout(drawFirstFrameTimeout);
              drawFirstFrameTimeout = null;
            }

            const onFrame = () => {
              raf = requestAnimationFrame(onFrame);
              if (!stateRef.current.context || !stateRef.current.canvasResizeValid) {
                return;
              }
              drawVideo(stateRef.current.context, video);
            };
            raf = requestAnimationFrame(onFrame);
          } else {
            cancelAnimationFrame(raf);
          }
        });
      };

      // handle resize
      const unobserveResize = observeResize(rootRef.current as HTMLElement, ({ width, height }) => {
        stateRef.current.rootSize = { w: width, h: height };
        stateRef.current.handleCanvasResize?.();
      });
      const unobserveDPR = observeDPR((dpr) => {
        stateRef.current.dpr = dpr;
        stateRef.current.handleCanvasResize?.();
      });

      let isPendingResize = false;
      let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
      stateRef.current.handleCanvasResize = (sync?: boolean) => {
        if (isPendingResize && !sync) {
          return;
        }

        isPendingResize = true;

        const resize = () => {
          isPendingResize = false;
          resizeTimeout = null;

          const dpr = stateRef.current.dpr;
          const rootSize = stateRef.current.rootSize;
          const rootSizePx = { w: rootSize.w * dpr, h: rootSize.h * dpr };
          const objectFit = stateRef.current.objectFit;
          const videoSize = stateRef.current.videoSize;

          if (!canvasRef.current || !stateRef.current.context) {
            return;
          }

          if (!videoSize) {
            canvasRef.current.width = 1;
            canvasRef.current.height = 1;
            clearCanvas(stateRef.current.context);
            return;
          }

          if (objectFit === 'fill') {
            let scale = { w: 1, h: 1 };
            if (rootSizePx.w > videoSize.w) {
              canvasRef.current.width = videoSize.w;
              scale.w = rootSizePx.w / videoSize.w / dpr;
            } else {
              canvasRef.current.width = Math.floor(rootSizePx.w);
              scale.w = 1 / dpr;
            }
            if (rootSizePx.h > videoSize.h) {
              canvasRef.current.height = videoSize.h;
              scale.h = rootSizePx.h / videoSize.h / dpr;
            } else {
              canvasRef.current.height = Math.floor(rootSizePx.h);
              scale.h = 1 / dpr;
            }
            canvasRef.current.style.transform = `scale(${scale.w}, ${scale.h})`;
            canvasRef.current.style.transformOrigin = 'left top';

            setEnableClip(stateRef.current.context, false);

            // // modify gl render uniforms
            // if (objectFit === 'cover') {
            //   let clipRatio = [0, 0] as [number, number];
            //   const rVideo = videoSize.w / videoSize.h;
            //   const rRoot = rootSizePx.w / rootSizePx.h;

            //   if (rVideo > rRoot) {
            //     clipRatio = [(rVideo - rRoot) / 2, 0];
            //   } else {
            //     // clipRatio = []
            //   }
            //   setEnableClip(stateRef.current.context, true);
            //   setClipRatio(stateRef.current.context, clipRatio);
            // } else {
            //   setEnableClip(stateRef.current.context, false);
            // }
          } else if (objectFit === 'contain') {
            let scale = { w: 1 / dpr, h: 1 / dpr };
            let transform = { x: 0, y: 0 };
            const rVideo = videoSize.w / videoSize.h;
            const rRoot = rootSizePx.w / rootSizePx.h;
            if (rVideo > rRoot) {
              let canvasWidth = rootSizePx.w;
              if (canvasWidth > videoSize.w) {
                canvasWidth = videoSize.w;
                scale.w = rootSizePx.w / videoSize.w / dpr;
                scale.h = scale.w;
              }
              canvasRef.current.width = Math.floor(canvasWidth);
              canvasRef.current.height = Math.floor(canvasWidth / rVideo);
              transform.y = (rootSize.h - canvasRef.current.height * scale.h) / 2;
            } else {
              let canvasHeight = rootSizePx.h;
              if (canvasHeight > videoSize.h) {
                canvasHeight = videoSize.h;
                scale.h = rootSizePx.h / videoSize.h / dpr;
                scale.w = scale.h;
              }
              canvasRef.current.width = Math.floor(canvasHeight * rVideo);
              canvasRef.current.height = Math.floor(canvasHeight);
              transform.x = (rootSize.w - canvasRef.current.width * scale.w) / 2;
            }
            canvasRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${scale.w}, ${scale.h})`;
            canvasRef.current.style.transformOrigin = 'left top';

            setEnableClip(stateRef.current.context, false);
          } else if (objectFit === 'cover') {
            const rVideo = videoSize.w / videoSize.h;
            const rRoot = rootSizePx.w / rootSizePx.h;
            const scale = { w: 1 / dpr, h: 1 / dpr };
            const clipRatio = [0, 0] as [number, number];

            let videoRenderPx = { w: videoSize.w, h: videoSize.h };
            if (rVideo >= rRoot) {
              videoRenderPx.w = (rRoot / rVideo) * videoRenderPx.w;

              if (videoRenderPx.h < rootSizePx.h) {
                scale.h = rootSizePx.h / videoRenderPx.h / dpr;
                scale.w = scale.h;
                canvasRef.current.height = Math.floor(videoRenderPx.h);
                canvasRef.current.width = Math.floor(videoRenderPx.w);
              } else {
                canvasRef.current.height = Math.floor(rootSizePx.h);
                canvasRef.current.width = Math.floor(rootSizePx.w);
              }

              clipRatio[0] = (rVideo - rRoot) / rVideo;
            } else {
              videoRenderPx.h = (rVideo / rRoot) * videoRenderPx.h;

              if (videoRenderPx.w < rootSizePx.w) {
                scale.w = rootSizePx.w / videoRenderPx.w / dpr;
                scale.h = scale.w;
                canvasRef.current.width = Math.floor(videoRenderPx.w);
                canvasRef.current.height = Math.floor(videoRenderPx.h);
              } else {
                canvasRef.current.width = Math.floor(rootSizePx.w);
                canvasRef.current.height = Math.floor(rootSizePx.h);
              }

              clipRatio[1] = (1 / rVideo - 1 / rRoot) / (1 / rVideo);
            }

            canvasRef.current.style.transform = `scale(${scale.w}, ${scale.h})`;
            canvasRef.current.style.transformOrigin = 'left top';
            setEnableClip(stateRef.current.context, true);
            setClipRatio(stateRef.current.context, clipRatio);
          }

          stateRef.current.canvasResizeValid = true;
          drawVideo(stateRef.current.context, video);
        };

        if (sync) {
          if (resizeTimeout) {
            clearTimeout(resizeTimeout);
          }
          resize();
        } else {
          resizeTimeout = setTimeout(() => {
            resize();
          }, 100);
        }
      };

      // Initial sync resize
      stateRef.current.rootSize = {
        w: rootRef.current.clientWidth,
        h: rootRef.current.clientHeight,
      };
      stateRef.current.handleCanvasResize(true);

      return () => {
        videoEvents.forEach((event) => {
          video.removeEventListener(event, onVideoEvents);
        });
        video.removeEventListener('loadeddata', onLoadedData);

        if (stateRef.current.context) {
          destroyGLContext(stateRef.current.context);
          stateRef.current.context = null;
        }

        unobserveResize();
        unobserveDPR();
      };
    }, []);

    useEffect(() => {
      if (stateRef.current.preMultipliedAlpha !== preMultipliedAlpha) {
        stateRef.current.preMultipliedAlpha = preMultipliedAlpha;
        if (stateRef.current.context) {
          setPremultipliedAlpha(stateRef.current.context, preMultipliedAlpha);
          // Force redraw
          // TODO: better update method
          stateRef.current.handleCanvasResize?.();
        }
      }
      if (stateRef.current.objectFit !== objectFit) {
        stateRef.current.objectFit = objectFit;
        stateRef.current.handleCanvasResize?.();
      }
      let autoPlayTimeout: ReturnType<typeof setTimeout> | null = null;
      if (stateRef.current.autoPlay !== autoPlay) {
        stateRef.current.autoPlay = autoPlay;
        if (autoPlay) {
          // fix safari autoplay
          autoPlayTimeout = setTimeout(() => {
            videoRef.current?.play();
          });
        }
      }

      return () => {
        if (autoPlayTimeout) {
          clearTimeout(autoPlayTimeout);
        }
      };
    }, [preMultipliedAlpha, objectFit, autoPlay]);

    const childrenNorm = Children.toArray(children).filter((child) => {
      if (!isValidElement(child)) {
        return false;
      }
      if (child.type !== TransparentVideoSource) {
        console.warn('TransparentVideo only accept TransparentVideoSource as children');
        return false;
      }
      return true;
    });

    if (childrenNorm.length === 0 && stateRef.current.lastVideoSrc && videoRef.current) {
      videoRef.current.load();
    }

    return (
      <div
        className={['__transparent-video__', className].filter(Boolean as any).join(' ')}
        style={style}
        ref={rootRef}
      >
        <canvas
          ref={canvasRef}
          {...canvasProps}
          style={{
            ...canvasProps?.style,
          }}
        />
        <video
          ref={videoRef}
          {...videoProps}
          loop={loop}
          autoPlay={autoPlay}
          muted={muted}
          playsInline={playsInline}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            if (video.currentSrc !== stateRef.current.lastVideoSrc) {
              stateRef.current.lastVideoSrc = video.currentSrc;
              const w = video.videoWidth;
              const h = Math.floor(video.videoHeight / 2);
              stateRef.current.videoSize = { w, h };
              stateRef.current.videoEverPlayed = false;
              stateRef.current.canvasResizeValid = false;

              if (rootRef.current) {
                rootRef.current.style.setProperty('--aspect-ratio', `${w} / ${h}`);
                rootRef.current.style.setProperty('--video-width', `${w}px`);
                rootRef.current.style.setProperty('--video-height', `${h}px`);
              }

              stateRef.current.handleCanvasResize?.();
            }

            videoProps?.onLoadedMetadata?.(e);
          }}
          onEmptied={(e) => {
            if (stateRef.current.lastVideoSrc) {
              stateRef.current.lastVideoSrc = '';
              stateRef.current.videoSize = null;
              stateRef.current.videoEverPlayed = false;
              stateRef.current.canvasResizeValid = false;

              if (rootRef.current) {
                rootRef.current.style.removeProperty('--aspect-ratio');
                rootRef.current.style.removeProperty('--video-width');
                rootRef.current.style.removeProperty('--video-height');
              }

              stateRef.current.handleCanvasResize?.();
            }

            videoProps?.onEmptied?.(e);
          }}
          style={{
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            visibility: 'hidden',
            position: 'absolute',
            pointerEvents: 'none',

            ...videoProps?.style,
          }}
        >
          {childrenNorm}
        </video>
      </div>
    );
  },
);

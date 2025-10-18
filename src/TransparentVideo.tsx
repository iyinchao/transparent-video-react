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

import { setupGLContext, setPremultipliedAlpha, drawVideo, destroyGLContext } from './gl-helper';
import { videoIsPlaying } from './utils';

export interface TransparentVideoHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  readonly isPlaying: boolean;
  getVideoElement: () => HTMLVideoElement | null;
  getCanvasElement: () => HTMLCanvasElement | null;
}

export type TransparentVideoSourceProps = SourceHTMLAttributes<HTMLSourceElement>;

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

export interface TransparentVideoProps {
  className?: string;
  style?: CSSProperties;
  muted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preMultipliedAlpha?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  videoProps?: React.HTMLProps<HTMLVideoElement>;
  canvasProps?: React.HTMLProps<HTMLCanvasElement>;
  children?: TransparentVideoSourceElement | TransparentVideoSourceElement[] | null;
}

export const TransparentVideo = forwardRef<TransparentVideoHandle, TransparentVideoProps>(
  (
    {
      className,
      style,
      muted,
      autoPlay = true,
      loop,
      playsInline,
      preMultipliedAlpha = false,
      children,
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stateRef = useRef<{
      lastVideoSrc: string;
      videoIsPlaying: boolean;
      videoEverPlayed: boolean;
      videoSize: { w: number; h: number } | null;
      context: WebGLRenderingContext | WebGL2RenderingContext | null;
      handleVideoChange?: () => void;
      handlePlayStateChange?: () => void;
    }>({
      lastVideoSrc: '',
      videoIsPlaying: false,
      videoEverPlayed: false,
      videoSize: null,
      context: null,
    });

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

    useLayoutEffect(() => {
      if (!canvasRef.current || !videoRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!stateRef.current.context) {
        stateRef.current.context = setupGLContext(canvas);
      }

      const videoEvents = ['playing', 'stalled', 'emptied', 'ended', 'pause'] as const;
      const onVideoEvents = (e: Event) => {
        const target = e.target as HTMLVideoElement;
        const isPlaying = videoIsPlaying(target);
        if (stateRef.current.videoIsPlaying !== isPlaying) {
          stateRef.current.videoIsPlaying = isPlaying;
          stateRef.current.handlePlayStateChange?.();
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
          // FIXME: should wait some time to make sure the first frame is ready
          // otherwise the first frame will be blank
        }, 100);
      };
      video.addEventListener('loadeddata', onLoadedData);

      // play state update
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
              if (!stateRef.current.context) {
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

      return () => {
        videoEvents.forEach((event) => {
          video.removeEventListener(event, onVideoEvents);
        });
        video.removeEventListener('loadeddata', onLoadedData);

        if (stateRef.current.context) {
          destroyGLContext(stateRef.current.context);
          stateRef.current.context = null;
        }
      };
    }, []);

    useEffect(() => {
      if (stateRef.current.context) {
        setPremultipliedAlpha(stateRef.current.context, preMultipliedAlpha);
      }
    }, [preMultipliedAlpha]);

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
      <div className={className} style={{ position: 'relative', ...style }}>
        <canvas
          ref={canvasRef}
          style={{
            aspectRatio: stateRef.current.videoSize
              ? stateRef.current.videoSize.w / stateRef.current.videoSize.h
              : undefined,
          }}
        />
        <video
          ref={videoRef}
          loop={loop}
          autoPlay={autoPlay}
          muted={muted}
          playsInline={playsInline}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            if (video.currentSrc !== stateRef.current.lastVideoSrc) {
              stateRef.current.lastVideoSrc = video.currentSrc;
              stateRef.current.videoSize = { w: video.videoWidth, h: video.videoHeight / 2 };
              stateRef.current.videoEverPlayed = false;
            }
          }}
          onEmptied={() => {
            if (stateRef.current.lastVideoSrc) {
              stateRef.current.lastVideoSrc = '';
              stateRef.current.videoSize = null;
              stateRef.current.videoEverPlayed = false;
            }
          }}
          style={{
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            visibility: 'hidden',
            position: 'absolute',
            pointerEvents: 'none',
          }}
        >
          {childrenNorm}
        </video>
      </div>
    );
  },
);

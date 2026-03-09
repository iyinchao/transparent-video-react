/* eslint-disable storybook/context-in-play-function */
import type { Meta } from '@storybook/react-vite';
import {
  TransparentVideo,
  TransparentVideoSource,
  type TransparentVideoRef,
  type WebGLContextEvent,
} from '../index';
import { useEffect, useRef, useState } from 'react';

import demoVideo1 from '../assets/demo-video-1.mp4';
import demoVideo2 from '../assets/demo-video-2.mp4';
import demoVideo3 from '../assets/demo-video-3.mp4';

import doc from './main.md?raw';
import { TransparentVideoRefTyped } from './typed';

import './main.css';

const meta = {
  title: 'Transparent Video React',
  component: TransparentVideo,
  subcomponents: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ['TransparentVideoSource']: TransparentVideoSource as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ['ref of <TransparentVideo />']: TransparentVideoRefTyped as any,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: doc,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TransparentVideo>;

export default meta;

export const KitchenSink = () => {
  const ref = useRef<TransparentVideoRef>(null);
  const [video, setVideo] = useState(demoVideo2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [preMultipliedAlpha, setPreMultipliedAlpha] = useState(false);
  const [objectFit, setObjectFit] = useState<'contain' | 'cover' | 'fill'>('cover');
  const [customSize, setCustomSize] = useState<boolean>(false);

  // Context event state
  const [glStatus, setGlStatus] = useState<'available' | 'lost' | 'creation-failed'>('available');
  const [contextLog, setContextLog] = useState<string[]>([]);
  const extRef = useRef<WEBGL_lose_context | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const originalGetContext = useRef<Function | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const addLog = (msg: string) => {
    setContextLog((prev) => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleContextEvent = (event: WebGLContextEvent) => {
    addLog(`${event.type}: ${event.message}`);
    if (event.type === 'context-lost') setGlStatus('lost');
    else if (event.type === 'context-restored') setGlStatus('available');
    else if (event.type === 'creation-failed') setGlStatus('creation-failed');
  };

  const handleLoseContext = () => {
    const canvas = ref.current?.getCanvasElement();
    if (!canvas) return;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;
    const ext = gl.getExtension('WEBGL_lose_context');
    extRef.current = ext;
    ext?.loseContext();
    addLog('Manually triggered loseContext()');
  };

  const handleRestoreContext = () => {
    extRef.current?.restoreContext();
    addLog('Manually triggered restoreContext()');
  };

  const handleDisableContext = () => {
    originalGetContext.current = HTMLCanvasElement.prototype.getContext;
    // simulate context creation fail
    HTMLCanvasElement.prototype.getContext = function (...args) {
      return null;
    };
    setRefreshKey((v) => v + 1);
    addLog('Manually test disable context creation.');
  };

  const handleEnableContext = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    HTMLCanvasElement.prototype.getContext = originalGetContext.current as any;
    setRefreshKey((v) => v + 1);

    addLog('Manually test enable context creation.');

    setTimeout(() => {
      const canvas = ref.current?.getCanvasElement();
      if (!canvas) return;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl?.isContextLost()) {
        setGlStatus('lost');
      } else {
        setGlStatus('available');
      }
    });
  };

  useEffect(() => {
    return () => {
      extRef.current = null;
    };
  }, []);

  return (
    <div className="demo">
      <div className="controls">
        <div className="playback">
          <button
            onClick={() => {
              if (isPlaying) {
                ref.current?.pause();
              } else {
                ref.current?.play();
              }
            }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={() => {
              ref.current?.seek(0);
              ref.current?.play();
            }}
          >
            ⏪
          </button>
        </div>
        <label>
          Video
          <select
            onChange={(e) => {
              setVideo(e.target.value);
            }}
            value={video}
          >
            <option value={''}>{'<none>'}</option>
            <option value={demoVideo1}>sample video 1</option>
            <option value={demoVideo2}>sample video 2</option>
            <option value={demoVideo3}>sample video 3</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            value={preMultipliedAlpha ? 'true' : 'false'}
            onChange={(e) => setPreMultipliedAlpha(e.target.checked)}
          ></input>
          Pre-multiplied alpha
        </label>
        <label>
          <input
            type="checkbox"
            value={customSize ? 'true' : 'false'}
            onChange={(e) => setCustomSize(e.target.checked)}
          ></input>
          Custom Size
        </label>
        {customSize && <desc className="desc">Drag the bottom right corner to resize</desc>}
        <label>
          Object Fit
          <select
            onChange={(e) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setObjectFit(e.target.value as any);
            }}
            value={objectFit}
            disabled={!customSize}
          >
            <option value={'contain'}>contain</option>
            <option value={'cover'}>cover</option>
            <option value={'fill'}>fill</option>
          </select>
        </label>
        <hr className="controls-divider" />
        <div className="gl-status">
          GL Status: <span className={`gl-indicator gl-indicator--${glStatus}`} /> {glStatus}
        </div>
        <div className="gl-controls">
          <button onClick={handleLoseContext} disabled={glStatus !== 'available'}>
            Context Lost
          </button>
          <button onClick={handleRestoreContext} disabled={glStatus !== 'lost'}>
            Context Restore
          </button>
          <button onClick={handleDisableContext} disabled={glStatus === 'creation-failed'}>
            Disable Context
          </button>
          <button onClick={handleEnableContext} disabled={glStatus !== 'creation-failed'}>
            Enable Context
          </button>
        </div>
        {contextLog.length > 0 && (
          <div className="context-log">
            {contextLog.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        )}
      </div>
      <div
        className="resizer"
        style={{
          width: 600,
          height: 300,
          display: customSize ? 'block' : 'contents',
          overflow: 'hidden',
          resize: 'both',
        }}
      >
        <TransparentVideo
          ref={ref}
          loop
          muted
          autoPlay
          objectFit={objectFit}
          preMultipliedAlpha={preMultipliedAlpha}
          style={
            !customSize
              ? {
                  maxWidth: '700px',
                }
              : {
                  width: '100%',
                  height: '100%',
                }
          }
          onPlayStateChange={(isPlaying) => {
            setIsPlaying(isPlaying);
          }}
          onContextEvent={handleContextEvent}
          key={refreshKey}
        >
          {video ? (
            <TransparentVideoSource
              src={video}
              type="video/mp4; codecs=av01.0.08M.08.0.110.01.01.01.1"
            />
          ) : null}
        </TransparentVideo>
      </div>
    </div>
  );
};

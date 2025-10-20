/* eslint-disable storybook/context-in-play-function */
import type { Meta } from '@storybook/react-vite';
import { TransparentVideo, TransparentVideoSource, type TransparentVideoRef } from '../index';
import { useRef, useState } from 'react';

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

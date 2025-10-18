import type { Meta } from '@storybook/react-vite';
import { TransparentVideo, TransparentVideoSource, type TransparentVideoHandle } from '../index';
import { useRef, useState } from 'react';

import demoVideo1 from '../assets/demo-video-1.mp4';
import demoVideo2 from '../assets/demo-video-2.mp4';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: '组件',
  component: TransparentVideo,
  parameters: {},
  tags: ['autodocs'],
} satisfies Meta<typeof TransparentVideo>;

export default meta;

export const Primary = () => {
  const ref = useRef<TransparentVideoHandle>(null);
  const [video, setVideo] = useState(demoVideo2);

  return (
    <div style={{ background: 'gray' }}>
      <div>
        <button
          onClick={() => {
            ref.current?.play();
          }}
        >
          ▶️
        </button>
        <button
          onClick={() => {
            ref.current?.pause();
          }}
        >
          ⏸️
        </button>
        <select
          onChange={(e) => {
            setVideo(e.target.value);
          }}
          value={video}
        >
          <option value={''}>empty</option>
          <option value={demoVideo1}>sample video 1</option>
          <option value={demoVideo2}>sample video 2</option>
        </select>
      </div>
      <TransparentVideo ref={ref} loop autoPlay muted playsInline>
        {video ? <TransparentVideoSource src={video} type="video/mp4" /> : null}
      </TransparentVideo>
    </div>
  );
};

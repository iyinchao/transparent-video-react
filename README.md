## Transparent Video React Component

> 🚧 Work in progress, use with caution in production.

A react component for stacked-alpha video.

The stacked-alpha video rendering technique is based on Jake Archibald's research: [article](https://jakearchibald.com/2024/video-with-transparency/) and his [web component repo](https://github.com/jakearchibald/stacked-alpha-video). This approach provides high compression efficiency while preserving excellent visual quality for transparent videos.

Enhanced for React.

## Enhancements

- **Optimized for React** - Compatiable with React's ref and state management.
- **Automatic canvas resizing** - Canvas automatically resizes to match its display size.
- **HIDPI/Retina support** - Automatically detects and adapts to high-DPI displays for crisp rendering.
- **Automatic source refresh** - Video automatically reloads when source props change.
- **Object-fit support** - Supports `contain`, `cover`, and `fill` modes for flexible video scaling.
- **Optimized render size** - Canvas render size is optimized to be as small as possible based on video dimensions and container size.
- **Optimized GL context** - Efficient WebGL context creation and cleanup.

## Usage

```tsx
import { TransparentVideo, TransparentVideoSource } from 'transparent-video-react';

<TransparentVideo autoPlay loop muted>
  <TransparentVideoSource src="video.mp4" type="video/mp4" />
  {/* or */}
  {/* <TransparentVideo.Source src="video.mp4" type="video/mp4" /> */}
</TransparentVideo>;
```

## Props

### `<TransparentVideo>`

| Name                 | Type                                                 | Default  | Description                                                     |
| -------------------- | ---------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `className`          | `string`                                             |          | CSS class name for the container                                |
| `style`              | `CSSProperties`                                      |          | Inline CSS styles for the container                             |
| `muted`              | `boolean`                                            |          | Whether the video is muted                                      |
| `autoPlay`           | `boolean`                                            |          | Whether the video plays automatically                           |
| `loop`               | `boolean`                                            |          | Whether the video loops                                         |
| `playsInline`        | `boolean`                                            |          | Whether the video plays inline (mobile)                         |
| `preMultipliedAlpha` | `boolean`                                            | `false`  | Whether the video uses premultiplied alpha                      |
| `objectFit`          | `'contain' \| 'cover' \| 'fill'`                     | `'fill'` | How the video is fitted to the container                        |
| `videoProps`         | `React.HTMLProps<HTMLVideoElement>`                  |          | Additional props for the video element                          |
| `canvasProps`        | `React.HTMLProps<HTMLCanvasElement>`                 |          | Additional props for the canvas element                         |
| `children`           | `TransparentVideoSource \| TransparentVideoSource[]` |          | `<TransparentVideoSource>` or `<TransparentVideo.Source>` nodes |
| `onPlayStateChange`  | `(isPlaying: boolean) => void`                       |          | Callback when play state changes                                |

### `<TransparentVideoSource>` or `<TransparentVideo.Source>`

| Name   | Type     | Default | Description                                |
| ------ | -------- | ------- | ------------------------------------------ |
| `src`  | `string` |         | URL of the video source                    |
| `type` | `string` |         | MIME type of the video (e.g., `video/mp4`) |

## Ref API (`TransparentVideoRef`)

The `TransparentVideo` component exposes a `TransparentVideoRef` with the following methods and properties:

| Name                  | Type                              | Description                                                                                     |
| --------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `play()`              | `() => void`                      | Play the video                                                                                  |
| `pause()`             | `() => void`                      | Pause the video                                                                                 |
| `seek(time)`          | `(time: number) => void`          | Seek to a specific time (in seconds)                                                            |
| `forceUpdate(resize)` | `(resize?: boolean) => void`      | Force draw the current frame. When `resize` is `true`, the canvas layout is recalculated first. |
| `isPlaying`           | `boolean`                         | Whether the video is currently playing                                                          |
| `getVideoElement()`   | `() => HTMLVideoElement \| null`  | Get the underlying video element                                                                |
| `getCanvasElement()`  | `() => HTMLCanvasElement \| null` | Get the underlying canvas element                                                               |

## Alpha Video Generation

Install `ffmpeg` to generate a stacked alpha video from a video with alpha channel.  
See [Jake Archibald's repo](https://github.com/jakearchibald/stacked-alpha-video?tab=readme-ov-file#encoding-av1) for more details, here is the generation method taken from that doc:

### Encoding AV1

> This is the ideal format, used by Chrome, Firefox, and Safari on iPhone 15 Pro or M3 MacBook Pro & newer.

```sh
INPUT="in.mov" OUTPUT="av1.mp4" CRF=45 CPU=3 bash -c 'ffmpeg -y -i "$INPUT" -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" -pix_fmt yuv420p -an -c:v libaom-av1 -cpu-used "$CPU" -crf "$CRF" -pass 1 -f null /dev/null && ffmpeg -y -i "$INPUT" -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" -pix_fmt yuv420p -an -c:v libaom-av1 -cpu-used "$CPU" -crf "$CRF" -pass 2 -movflags +faststart "$OUTPUT"'
```

- `CRF` (0-63): Lower values are higher quality, larger filesize.
- `CPU` (0-8): Weirdly, _lower_ values use more CPU, which improves quality, but encodes much slower. Usually not got lower than 3.

### Encoding HEVC

> For Safari on other devices, they need a less-efficient HEVC.

```sh
INPUT="in.mov" OUTPUT="hevc.mp4" CRF=30 PRESET="veryslow" bash -c 'ffmpeg -y -i "$INPUT" -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" -pix_fmt yuv420p -an -c:v libx265 -preset "$PRESET" -crf "$CRF" -tag:v hvc1 -movflags +faststart "$OUTPUT"'
```

- `CRF` (0-63): Lower values are higher quality, larger filesize.
- `PRESET` (`medium`, `slow`, `slower`, `veryslow`): The slower you go, the better the output.

## TODO

**Features**

- [ ] Support `object-position`
- [ ] Anti-aliasing

**Known issues**

- [ ] First frame render sometimes is blank, find a better way to handle this
- [ ] If `autoPlay` is enabled, since resize canvas is debounced (100ms), first 100ms video render will be skipped

## Credits

- [Jake Archibald](https://jakearchibald.com/) for the original research and code

## License

MIT

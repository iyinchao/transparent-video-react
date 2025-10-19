> 🚧 Work in progress, use with caution in production.

A react component for stacked-alpha video.

The stacked-alpha video rendering technique is based on Jake Archibald's research: [article](https://jakearchibald.com/2024/video-with-transparency/) and his [web component repo](https://github.com/jakearchibald/transparent-video). This approach provides high compression efficiency while preserving excellent visual quality for transparent videos.

Enhanced for React.

## Usage

```tsx
import { TransparentVideo, TransparentVideoSource } from 'transparent-video-react';

<TransparentVideo>
  <TransparentVideoSource src="video.mp4" type="video/mp4" />
  {/* or */}
  {/* <TransparentVideo.Source src="video.mp4" type="video/mp4" /> */}
</TransparentVideo>;
```

To compatible with browsers that not support `av1` codecs, you need to provide a HEVC video and set proper source type codecs:

```tsx
<TransparentVideo>
  <TransparentVideo.Source
    src="video.mp4"
    type="video/mp4; codecs=av01.0.08M.08.0.110.01.01.01.1"
  />
  <TransparentVideo.Source src="video.hevc.mp4" type="video/mp4; codecs=hvc1.1.6.H120.b0" />
</TransparentVideo>
```

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

## Demo

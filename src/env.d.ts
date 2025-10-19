/// <reference types="vite/client" />

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*?raw' {
  const src: string;
  export default src;
}

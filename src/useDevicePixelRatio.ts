import { useEffect, useRef } from 'react';

type updateCb = (dpr: number) => void;
const cbList = new Set<updateCb>();
let cbCount = 0;
let mediaQuery: MediaQueryList | null = null;
let mediaQueryCb: EventListener | null = null;
const startListen = (cb: updateCb) => {
  cbList.add(cb);
  if (cbCount === 0) {
    mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const mediaQueryCb = () => {
      mediaQuery?.removeEventListener('change', mediaQueryCb);
      const newMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mediaQuery = newMedia;
      newMedia.addEventListener('change', mediaQueryCb);
      cbList.forEach((cb) => {
        cb(window.devicePixelRatio);
      });
    };
    mediaQuery.addEventListener('change', mediaQueryCb);
  }
  cbCount++;
};
const stopListen = (cb: updateCb) => {
  cbList.delete(cb);
  if (cbCount === 1) {
    if (mediaQuery && mediaQueryCb) {
      mediaQuery.removeEventListener('change', mediaQueryCb);
      mediaQuery = null;
      mediaQueryCb = null;
    }
  }
  cbCount--;
};

export function useDevicePixelRatio() {
  const listeners = useRef(new Set<updateCb>());

  useEffect(() => {
    const cb = (dpr: number) => {
      listeners.current.forEach((v) => {
        v(dpr);
      });
    };
    startListen(cb);

    return () => {
      stopListen(cb);
    };
  }, []);

  const observe = (cb: updateCb) => {
    listeners.current.add(cb);
    return () => {
      listeners.current.delete(cb);
    };
  };

  return {
    observe,
  };
}

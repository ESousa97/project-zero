// types/global.d.ts
declare global {
  interface Window {
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
  }
}

export {};

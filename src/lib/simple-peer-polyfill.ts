
if (typeof window !== 'undefined') {
    (window as any).global = window;
    (window as any).process = { env: {} };
    (window as any).Buffer = window.Buffer || require('buffer').Buffer;
  }
  
  export { default as SimplePeer } from 'simple-peer';
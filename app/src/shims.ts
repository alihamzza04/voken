// Polyfills for browser environment
// This file must be imported BEFORE any Solana libraries

// @ts-ignore
import { Buffer as BufferPolyfill } from "buffer";

// @ts-ignore
window.Buffer = window.Buffer || BufferPolyfill;
window.global = window;
window.process = window.process || { env: {}, browser: true };

// @ts-ignore
const originalBuffer = window.Buffer;
Object.defineProperty(window, "Buffer", {
  value: originalBuffer,
  writable: true,
  configurable: true,
});

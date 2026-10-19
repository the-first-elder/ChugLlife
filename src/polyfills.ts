import { Buffer } from "buffer";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

declare global {
  interface Window {
    Buffer: Buffer;
  }
}

window.Buffer = window.Buffer ?? Buffer;
TimeAgo.addDefaultLocale(en);

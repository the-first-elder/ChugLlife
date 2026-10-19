import { Buffer } from "buffer";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

window.Buffer = window.Buffer ?? Buffer;
TimeAgo.addDefaultLocale(en);

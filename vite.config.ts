import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    target: "esnext",
    rollupOptions: {},
  },
  plugins: [react()],
  optimizeDeps: {
    // XMTP docs: the wasm module + its worker must not be pre-bundled, or the
    // OPFS sqlite worker traps with "memory access out of bounds".
    exclude: ["@xmtp/wasm-bindings", "@xmtp/browser-sdk"],
    include: ["@xmtp/content-type-primitives"],
  },
  server: {
    port: 5173,
  },
});

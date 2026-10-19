import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    target: "esnext",
    rollupOptions: {},
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@xmtp/browser-sdk"],
  },
  server: {
    port: 5173,
  },
});

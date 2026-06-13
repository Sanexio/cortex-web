import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    strictPort: true,
    host: "127.0.0.1",
    allowedHosts: [
      "127.0.0.1",
      "localhost",
      "cluster-mini-04",
      "cluster-mini-04.piranha-marlin.ts.net",
    ],
  },
  preview: {
    port: 5176,
    host: "127.0.0.1",
  },
});

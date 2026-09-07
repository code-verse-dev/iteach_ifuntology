import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": { target: "http://localhost:3034", changeOrigin: true },
      "/Uploads": { target: "http://localhost:3034", changeOrigin: true },
      "/uploads": { target: "http://localhost:3034", changeOrigin: true },
    },
  },
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

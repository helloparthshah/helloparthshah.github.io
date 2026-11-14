import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // three.js changes rarely, so cache it separately from app code
        manualChunks(id) {
          if (id.includes("node_modules/three/")) return "three";
          if (id.includes("@react-three")) return "r3f";
        },
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-router") || id.includes("@remix-run")) {
            return "vendor-router";
          }

          if (id.includes("@splinetool/react-spline")) {
            return "vendor-spline-react";
          }

          if (id.includes("@splinetool/runtime")) {
            if (id.includes("physics")) return "vendor-spline-physics";
            if (id.includes("navmesh")) return "vendor-spline-navmesh";
            if (id.includes("gaussian-splat")) return "vendor-spline-splats";
            if (id.includes("opentype")) return "vendor-spline-opentype";
            if (id.includes("howler")) return "vendor-spline-audio";
            if (id.includes("boolean")) return "vendor-spline-boolean";
            if (id.includes("process")) return "vendor-spline-process";
            if (id.includes("ui")) return "vendor-spline-ui";
            return "vendor-spline-runtime";
          }

          if (id.includes("three") || id.includes("cannon") || id.includes("howler")) {
            return "vendor-3d-core";
          }

          if (id.includes("axios")) {
            return "vendor-network";
          }

          if (id.includes("lucide-react") || id.includes("@radix-ui")) {
            return "vendor-ui";
          }

          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }

          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          return "vendor-misc";
        },
      },
    },
  },
});

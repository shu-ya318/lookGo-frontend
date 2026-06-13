import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/services": path.resolve(__dirname, "src/services"),
      "@/stores": path.resolve(__dirname, "src/stores"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/pages": path.resolve(__dirname, "src/pages"),
      "@/stylesheets": path.resolve(__dirname, "src/stylesheets"),
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
    },
  },
});

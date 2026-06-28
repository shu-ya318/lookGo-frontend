import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["d3", "xlsx", "@mui/x-data-grid"],
  },
  resolve: {
    alias: {
      "@/services": path.resolve(__dirname, "src/services"),
      "@/stores": path.resolve(__dirname, "src/stores"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/pages": path.resolve(__dirname, "src/pages"),
      "@/stylesheets": path.resolve(__dirname, "src/stylesheets"),
      "@/assets": path.resolve(__dirname, "src/assets"),
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

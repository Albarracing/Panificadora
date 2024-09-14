import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist", // Directorio de salida
    assetsDir: "assets", // Directorio de archivos estáticos
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  server: {
    port: 5173,
  },
  plugins: [react()],
});

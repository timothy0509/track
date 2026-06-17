import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: {
        autoCodeSplitting: true,
      },
    }),
    viteReact(),
    nitro(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

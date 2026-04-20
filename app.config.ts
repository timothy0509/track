import { defineConfig } from "@tanstack/start-config";
import { TanStackStartVite } from "@tanstack/react-start/plugin/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  vite: {
    plugins: [
      TanStackRouterVite({ autoCodeSplitting: true }),
      TanStackStartVite(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
});

import { createStart } from "@tanstack/react-start";
import { TanStackStartVite } from "@tanstack/react-start/config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default createStart({
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

// app.config.ts
import { createStart } from "@tanstack/react-start";
import { TanStackStartVite } from "@tanstack/react-start/config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
var app_config_default = createStart({
  vite: {
    plugins: [
      TanStackRouterVite({ autoCodeSplitting: true }),
      TanStackStartVite(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    }
  }
});
export {
  app_config_default as default
};

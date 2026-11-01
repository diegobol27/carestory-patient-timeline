// @lovable.dev/vite-tanstack-config ya incluye los plugins necesarios.
// No agregar plugins duplicados.

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node_server",
  },
});

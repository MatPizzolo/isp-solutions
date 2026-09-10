import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Config aparte de Next: los tests solo cubren funciones puras de src/lib
// (pricing y eligibility), así que no hace falta jsdom ni transformar JSX.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    globals: false,
  },
  resolve: {
    // Espeja "@/*" de tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});

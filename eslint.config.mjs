import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Patrón usado en dashboard, dreams/[id] y DreamCalendar; se revisará después.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    // Ignorados por defecto de eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Proyecto Android generado por Capacitor y su carpeta web vacía:
    "android/**",
    "my-app/**",
  ]),
]);

export default eslintConfig;

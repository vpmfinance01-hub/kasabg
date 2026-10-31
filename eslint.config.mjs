import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Загрузката на данни от Supabase в useEffect е умишлена в тези клиентски страници.
  { rules: { "react-hooks/set-state-in-effect": "off" } },
  // Данните от външни платформи (WooCommerce, Shopify) нямат фиксирана форма: там any е умишлен.
  { files: ["src/lib/integrations/**", "src/app/api/hooks/**", "test/**"], rules: { "@typescript-eslint/no-explicit-any": "off" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "sample/**"]),
]);

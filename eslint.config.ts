import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
// @ts-expect-error - missing types
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  // ── Global ignores ──────────────────────────────────────────────────────────
  {
    ignores: [
      "dist/**",
      "build/**",
      ".yarn/**",
      "node_modules/**",
      "src/routeTree.gen.ts",
      "src/components/ui/**", // shadcn/ui auto-generated — not authored code
    ],
  },

  // ── Base JS rules ────────────────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript ───────────────────────────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── React Hooks + JSX a11y + Import order ────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Hooks
      ...pluginReactHooks.configs.recommended.rules,

      // a11y
      ...pluginJsxA11y.configs.recommended.rules,

      // Import sort
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",

      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);

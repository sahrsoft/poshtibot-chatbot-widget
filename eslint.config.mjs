import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import prettier from "eslint-config-prettier"

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.

  // disables ESLint rules that conflict with Prettier
  prettier,

  {
    rules: {
      // 🔥 Best practice rules
      "prefer-const": "error",
      "no-var": "error",
      "no-debugger": "error",

      // ⚠️ logging control
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // 🧠 code safety
      eqeqeq: "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      // 🧩 your style (no semicolons, no commas)
      semi: ["error", "never"],
      "comma-dangle": ["error", "never"],

      // ⚛️ React safety (Next.js friendly)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // 🚀 Next.js improvements
      "@next/next/no-img-element": "warn"
    }
  },

  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts"
  ])
])

export default eslintConfig

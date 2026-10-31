import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // eslint-config-next already registers the jsx-a11y plugin;
      // apply the full recommended rule set on top of its subset.
      ...jsxA11y.flatConfigs.recommended.rules,
      "react/button-has-type": "error",
      // Labels wrap their input and render text from props a few elements deep.
      "jsx-a11y/label-has-associated-control": ["error", { assert: "either", depth: 4 }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "playwright-report/**", "test-results/**"]),
]);

export default eslintConfig;

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "react", "import"],
  rules: {
    // Your base rules here
  },
  overrides: [
    {
      files: ["src/supabase/functions/**/*.ts"],
      env: {
        deno: true, // Use Deno's global scope
      },
      rules: {
        "import/no-unresolved": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "no-undef": "off",
      },
    },
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
};

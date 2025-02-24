const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const baseConfig = require("../eslint.config.cjs");
const ngrx = require("@ngrx/eslint-plugin/v9");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ["**/dist"],
  },
  ...baseConfig,
  {
    files: ["**/*.ts"],
    plugins: { ngrx :  ngrx.configs.signals},
    rules: {
      // "@ngrx/with-state-no-arrays-at-root-level": "warn",
    },
  },
  ...compat
    .config({
      extends: [
        "plugin:@nx/angular",
        "plugin:@angular-eslint/template/process-inline-templates",
      ],
    })
    .map((config) => ({
      ...config,
      files: ["**/*.ts"],
      rules: {
        ...config.rules,
        "@angular-eslint/directive-selector": [
          "error",
          {
            type: "attribute",
            prefix: "ReqQuest",
            style: "camelCase",
          },
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            type: "element",
            prefix: "reqquest",
            style: "kebab-case",
          },
        ],
      },
    })),
  ...compat
    .config({
      extends: ["plugin:@nx/angular-template"],
    })
    .map((config) => ({
      ...config,
      files: ["**/*.html"],
      rules: {
        ...config.rules,
      },
    })),
];

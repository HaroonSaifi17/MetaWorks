const js = require('@eslint/js');
const nxEslintPlugin = require('@nx/eslint-plugin');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
  {
    files: ['**/*spec.ts'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
  {
    ignores: ['**/dist'],
  },
  js.configs.recommended,
  {
    plugins: {
      '@nx': nxEslintPlugin,
    },
  },
  {
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
        },
      ],
    },
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
];


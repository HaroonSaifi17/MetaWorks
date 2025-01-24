const js = require("@eslint/js");
const nxEslintPlugin = require("@nx/eslint-plugin");

module.exports = [
    {
        ignores: [
            "**/dist"
        ]
    },
    js.configs.recommended,
    { plugins: { "@nx": nxEslintPlugin } },
    {
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [],
                    depConstraints: [
                        {
                            sourceTag: "*",
                            onlyDependOnLibsWithTags: [
                                "*"
                            ]
                        }
                    ]
                }
            ]
        }
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
    }
];

import astroParser from 'astro-eslint-parser';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
    {
        ignores: ['.astro/**', 'dist/**', 'node_modules/**'],
    },

    ...tseslint.configs.strict,
    ...tseslint.configs.recommended,
    ...eslintPluginAstro.configs.recommended,
    ...eslintPluginAstro.configs['jsx-a11y-strict'],

    {
        files: ['**/*.astro'],
        languageOptions: {
            parser: astroParser,
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.astro'],
            },
        },
        rules: {
            'no-console': 'warn',
            'astro/no-set-html-directive': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
    {
        files: ['**/SEO.astro'],
        rules: {
            'astro/no-set-html-directive': 'off',
        },
    },
    {
        files: ['**/ProjectCard.astro'],
        rules: {
            'astro/no-set-html-directive': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.mts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
    },
];

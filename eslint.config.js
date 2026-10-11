import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
    { ignores: ['dist', 'node_modules', '_design/**'] },
    {
        files: ['**/*.{js,jsx,mjs}'],
        languageOptions: {
            ecmaVersion: 2023,
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: 'detect' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'unused-imports': unusedImports,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            'react/prop-types': 'off',
            'no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
    {
        files: ['**/*.test.{js,jsx}'],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
    {
        /**
         * The ported v1 logic layer.
         *
         * These directories are marked keep-as-is in _design/PROPOSAL.md §5.1.
         * They are copied verbatim from ../en-practice, so they are linted for
         * real defects but NOT for v2's own conventions — rewriting them to
         * satisfy `unused-imports/no-unused-imports` would create exactly the
         * divergence from v1 that makes a port expensive to maintain. Unused
         * imports here are a warning, so they stay visible without blocking.
         */
        files: [
            'src/api/**/*.js',
            'src/hooks/**/*.js',
            'src/contexts/**/*.js',
            'src/contexts/**/*.jsx',
            'src/utils/**/*.js',
            'src/config/**/*.js',
            'src/seo/**/*.js',
            'src/firebase.js',
        ],
        rules: {
            'unused-imports/no-unused-imports': 'warn',
            'react-refresh/only-export-components': 'off',
            'no-empty': 'warn',
            'no-useless-escape': 'warn',
            /**
             * Two newer react-hooks rules flag 9 pre-existing sites in v1's code:
             * `setState` called synchronously inside an effect, and a ref read
             * during render (src/hooks/useTimer.js:32).
             *
             * Downgraded rather than switched off, deliberately. They are real
             * React smells and they should be visible — but this directory is a
             * verbatim copy, and refactoring it now would both risk behaviour
             * changes in code the anchor screens are about to depend on, and
             * create divergence from ../en-practice that makes the next re-copy
             * unsafe. Fix them in v1 first, then re-copy.
             */
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/refs': 'warn',
        },
    },
];

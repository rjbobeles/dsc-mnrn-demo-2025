import nx from '@nx/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import eslintPluginImport from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    plugins: {
      prettier: prettierPlugin,
      import: eslintPluginImport,
    },
  },
  prettierConfig,
  {
    ignores: ['**/dist'],
  },
  {
    rules: {
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
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
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'sibling', 'index', 'unknown'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      radix: 'off',
      'dot-notation': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-named-default': 'off',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'no-shadow': 'off',
      'no-underscore-dangle': 'off',
      'no-nested-ternary': 'off',
      'no-useless-constructor': 'off',
      'class-methods-use-this': 'warn',
      camelcase: 'off',
    },
  },
]

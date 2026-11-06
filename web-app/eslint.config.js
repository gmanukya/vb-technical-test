import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ConditionalExpression',
          message: 'Do not use ternaries in components. Use early returns, records, or a child component.',
        },
        {
          selector: 'JSXExpressionContainer > LogicalExpression',
          message: 'Do not put logical expressions in JSX. Extract a component that returns null.',
        },
      ],
    },
  },
)

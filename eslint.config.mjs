import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ...js.configs.recommended,
    files: ['**/*.js', '**/requirejs-esm-serve']
  },
  {
    files: ['**/*.js', '**/requirejs-esm-serve'],
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  }
]

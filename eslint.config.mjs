import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ...js.configs.recommended,
    files: ['**/*.js', '**/requirejs-esm-serve.js']
  },
  {
    files: ['**/*.js', '**/requirejs-esm-serve.js'],
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  }
]

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    '../../.eslintrc.json',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['svelte3', '@typescript-eslint'],
  ignorePatterns: ['!**/*', '*.cjs', "node_modules/**/*", ".svelte-kit/**/*", "svelte.config.js", "vite.config.ts"],
  overrides: [
    {
      files: ['*.ts', '*.js', '*.svelte'],
      parserOptions: {
        project: ['apps/%FRONTEND_NAME%/tsconfig.*?.json'],
      },
      rules: {},
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {},
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {},
    },
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  settings: {
    'svelte3/typescript': require('typescript'),
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
};

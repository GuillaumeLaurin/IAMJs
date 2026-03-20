// @ts-check
import eslint from '@eslint/js';
import { configs as airbnbConfigs } from 'eslint-config-airbnb-extended/legacy';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // Airbnb base style guide (no React) + TypeScript support via flat config
  ...airbnbConfigs.base.recommended,
  ...airbnbConfigs.base.typescript,

  // TypeScript strict type-checked rules
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Prettier (must be last to override formatting conflicts)
  eslintPluginPrettierRecommended,

  // Language & parser options
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Custom rule overrides
  {
    rules: {
      // ── Airbnb overrides (relaxed for NestJS / backend DI patterns) ──
      'class-methods-use-this': 'off',
      'no-useless-constructor': 'off',
      'import/prefer-default-export': 'off',

      // ── TypeScript ──
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', format: ['PascalCase'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      ],

      // ── Prettier ──
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
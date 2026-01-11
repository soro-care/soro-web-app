// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // -----------------------------------------
  // 1️⃣ Ignore
  // -----------------------------------------
  {
    ignores: ['eslint.config.mjs', 'dist/**'],
  },

  // -----------------------------------------
  // 2️⃣ Base JS rules
  // -----------------------------------------
  eslint.configs.recommended,

  // -----------------------------------------
  // 3️⃣ TypeScript (NON-type-aware) – applies to ALL TS files
  // -----------------------------------------
  ...tseslint.configs.recommended,

  // -----------------------------------------
  // 4️⃣ TypeScript (TYPE-AWARE) – ONLY src/**
  // -----------------------------------------
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Relaxed NestJS-friendly rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/require-await': 'off',
    },
  },

  // -----------------------------------------
  // 5️⃣ Tests (NO typed rules)
  // -----------------------------------------
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'off',
    },
  },

  // -----------------------------------------
  // 6️⃣ Prettier LAST
  // -----------------------------------------
  eslintPluginPrettierRecommended,
);

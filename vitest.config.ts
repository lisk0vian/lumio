import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Mirrors the `@/* -> ./src/*` alias from tsconfig.json so tests resolve
// the same paths the app bundles with.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

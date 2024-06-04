import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: ['**/node_modules/**', '**/utils.test.ts'],
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
    environmentOptions: {
      databaseEnvName: 'test',
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
})

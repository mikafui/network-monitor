import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        extends: './packages/components/vitest.config.ts',
        test: {
          name: 'components'
        }
      }
    ]
  }
});
